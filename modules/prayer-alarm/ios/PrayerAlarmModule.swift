import ExpoModulesCore
import SwiftUI
#if canImport(AlarmKit)
import AlarmKit
#endif

/**
 * Vakit alarmları — iOS 26 AlarmKit.
 *
 * Sistem alarmı olarak çalar: sessiz anahtarı ve Odak modu açıkken de
 * duyulur, kilit ekranında tam alarm arayüzü gösterir. Uygulamanın kurduğu
 * alarmlar yalnız bu uygulamaya aittir; `replace` ile hepsi silinip
 * plan baştan kurulur.
 */
public class PrayerAlarmModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PrayerAlarm")

    Function("isAvailable") { () -> Bool in
      if #available(iOS 26.0, *) { return true }
      return false
    }

    Function("getAuthorizationStatus") { () -> String in
      if #available(iOS 26.0, *) {
        return Self.statusString(AlarmManager.shared.authorizationState)
      }
      return "unavailable"
    }

    AsyncFunction("requestAuthorization") { () async throws -> String in
      if #available(iOS 26.0, *) {
        let state = try await AlarmManager.shared.requestAuthorization()
        return Self.statusString(state)
      }
      return "unavailable"
    }

    /// Kurulan alarm sayısını döner; sistem sınırına gelinirse kalanlar atlanır.
    AsyncFunction("scheduleAlarms") { (items: [AlarmItem], replace: Bool) async throws -> Int in
      guard #available(iOS 26.0, *) else { return 0 }
      let manager = AlarmManager.shared
      guard manager.authorizationState == .authorized else { return 0 }

      if replace {
        for alarm in try manager.alarms {
          try? manager.cancel(id: alarm.id)
        }
      }

      var scheduled = 0
      for item in items {
        let date = Date(timeIntervalSince1970: item.timestamp / 1000)
        guard date > Date() else { continue }
        do {
          _ = try await manager.schedule(
            id: UUID(),
            configuration: Self.configuration(for: item, at: date)
          )
          scheduled += 1
        } catch AlarmManager.AlarmError.maximumLimitReached {
          break
        }
      }
      return scheduled
    }

    AsyncFunction("cancelAll") { () throws in
      guard #available(iOS 26.0, *) else { return }
      let manager = AlarmManager.shared
      for alarm in try manager.alarms {
        try? manager.cancel(id: alarm.id)
      }
    }
  }

  @available(iOS 26.0, *)
  private static func statusString(_ state: AlarmManager.AuthorizationState) -> String {
    switch state {
    case .authorized: return "authorized"
    case .denied: return "denied"
    case .notDetermined: return "notDetermined"
    @unknown default: return "denied"
    }
  }

  @available(iOS 26.0, *)
  private static func configuration(
    for item: AlarmItem,
    at date: Date
  ) -> AlarmManager.AlarmConfiguration<PrayerAlarmMetadata> {
    let title = LocalizedStringResource("\(item.title)")
    let alert: AlarmPresentation.Alert
    if #available(iOS 26.1, *) {
      alert = AlarmPresentation.Alert(title: title)
    } else {
      alert = AlarmPresentation.Alert(
        title: title,
        stopButton: AlarmButton(
          text: LocalizedStringResource("\(item.stopLabel)"),
          textColor: .white,
          systemImageName: "stop.circle"
        )
      )
    }
    let attributes = AlarmAttributes<PrayerAlarmMetadata>(
      presentation: AlarmPresentation(alert: alert),
      tintColor: Color(red: 0.72, green: 0.54, blue: 0.18)
    )
    return .alarm(
      schedule: .fixed(date),
      attributes: attributes,
      sound: item.sound.isEmpty ? .default : .named(item.sound)
    )
  }
}

@available(iOS 26.0, *)
struct PrayerAlarmMetadata: AlarmMetadata {}

struct AlarmItem: Record {
  /// Unix ms
  @Field var timestamp: Double = 0
  @Field var title: String = ""
  @Field var stopLabel: String = "Stop"
  /// Uygulama paketindeki ses dosyası; boşsa sistem alarm sesi
  @Field var sound: String = ""
}
