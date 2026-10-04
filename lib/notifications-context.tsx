import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSettings } from "@/lib/settings-context";
import {
  ALARM_SLOTS,
  configureNotificationHandler,
  DEFAULT_NOTIFICATION_PREFS,
  getPermissionState,
  LEAD_OPTIONS,
  reschedulePrayerNotifications,
  requestPermission,
  type AlarmSlot,
  type LeadMinutes,
  type NotificationPrefs,
  type PermissionState,
} from "@/lib/prayer-notifications";
import type { PrayerSlotId } from "@/lib/prayer-times";
import {
  getAlarmAuthorization,
  requestAlarmAuthorization,
  type AlarmAuthorization,
} from "@/modules/prayer-alarm";
import {
  availableSounds,
  type NotificationSound,
  type SoundKind,
} from "@/lib/notification-sounds";

const PREFS_KEY = "namaz_rehberi_notification_prefs";

type NotificationsContextValue = {
  prefs: NotificationPrefs;
  permission: PermissionState;
  /** iOS 26+ sistem alarmı izni; "unavailable" → alarm bildirimle çalar */
  alarmAuth: AlarmAuthorization;
  /** true: izin verildi ve açıldı; false: izin reddedildi */
  setEnabled: (value: boolean) => Promise<boolean>;
  toggleSlot: (slot: PrayerSlotId) => Promise<void>;
  toggleAlarm: (slot: AlarmSlot) => Promise<void>;
  setLeadMinutes: (value: LeadMinutes) => Promise<void>;
  setSound: (kind: SoundKind, value: NotificationSound) => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

function parsePrefs(raw: string | null): NotificationPrefs {
  if (!raw) return DEFAULT_NOTIFICATION_PREFS;
  try {
    const value = JSON.parse(raw) as Partial<NotificationPrefs>;
    const lead = LEAD_OPTIONS.includes(value.leadMinutes as LeadMinutes)
      ? (value.leadMinutes as LeadMinutes)
      : DEFAULT_NOTIFICATION_PREFS.leadMinutes;
    const pickSound = (
      v: unknown,
      kind: SoundKind,
      fallback: NotificationSound,
    ) =>
      availableSounds(kind).includes(v as NotificationSound)
        ? (v as NotificationSound)
        : fallback;
    return {
      enabled: value.enabled === true,
      slots: { ...DEFAULT_NOTIFICATION_PREFS.slots, ...value.slots },
      leadMinutes: lead,
      atSound: pickSound(
        value.atSound,
        "at",
        DEFAULT_NOTIFICATION_PREFS.atSound,
      ),
      leadSound: pickSound(
        value.leadSound,
        "lead",
        DEFAULT_NOTIFICATION_PREFS.leadSound,
      ),
      alarms: Object.fromEntries(
        ALARM_SLOTS.map((slot) => [slot, value.alarms?.[slot] === true]),
      ) as Record<AlarmSlot, boolean>,
      alarmSound: pickSound(
        value.alarmSound,
        "alarm",
        DEFAULT_NOTIFICATION_PREFS.alarmSound,
      ),
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { ready: settingsReady, city, locale } = useAppSettings();
  const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATION_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("undetermined");
  const [alarmAuth, setAlarmAuth] = useState(getAlarmAuthorization);
  const [foregroundTick, setForegroundTick] = useState(0);

  useEffect(() => {
    configureNotificationHandler();
    let active = true;
    void Promise.all([
      AsyncStorage.getItem(PREFS_KEY),
      getPermissionState(),
    ]).then(([raw, state]) => {
      if (!active) return;
      setPrefs(parsePrefs(raw));
      setPermission(state);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Uygulama öne gelince: izin sistemden değişmiş olabilir; pencere de kaydırılır
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      void getPermissionState().then(setPermission);
      setAlarmAuth(getAlarmAuthorization());
      setForegroundTick((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!loaded || !settingsReady) return;
    void reschedulePrayerNotifications(city, prefs, locale).catch(() => {
      // Planlama başarısızsa uygulama akışı etkilenmesin
    });
  }, [
    loaded,
    settingsReady,
    city,
    prefs,
    locale,
    permission,
    alarmAuth,
    foregroundTick,
  ]);

  const persist = useCallback(async (next: NotificationPrefs) => {
    setPrefs(next);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  }, []);

  const setEnabled = useCallback(
    async (value: boolean) => {
      if (value) {
        const state = await requestPermission();
        setPermission(state);
        if (state !== "granted") return false;
      }
      await persist({ ...prefs, enabled: value });
      return true;
    },
    [prefs, persist],
  );

  const toggleSlot = useCallback(
    async (slot: PrayerSlotId) => {
      await persist({
        ...prefs,
        slots: { ...prefs.slots, [slot]: !prefs.slots[slot] },
      });
    },
    [prefs, persist],
  );

  const toggleAlarm = useCallback(
    async (slot: AlarmSlot) => {
      // İlk alarm açılırken sistem alarm izni istenir; reddedilirse bildirimle çalar
      if (!prefs.alarms[slot] && alarmAuth === "notDetermined") {
        setAlarmAuth(await requestAlarmAuthorization());
      }
      await persist({
        ...prefs,
        alarms: { ...prefs.alarms, [slot]: !prefs.alarms[slot] },
      });
    },
    [prefs, persist, alarmAuth],
  );

  const setLeadMinutes = useCallback(
    async (value: LeadMinutes) => {
      await persist({ ...prefs, leadMinutes: value });
    },
    [prefs, persist],
  );

  const setSound = useCallback(
    async (kind: SoundKind, value: NotificationSound) => {
      const key =
        kind === "at" ? "atSound" : kind === "lead" ? "leadSound" : "alarmSound";
      await persist({ ...prefs, [key]: value });
    },
    [prefs, persist],
  );

  const value = useMemo(
    () => ({
      prefs,
      permission,
      alarmAuth,
      setEnabled,
      toggleSlot,
      toggleAlarm,
      setLeadMinutes,
      setSound,
    }),
    [
      prefs,
      permission,
      alarmAuth,
      setEnabled,
      toggleSlot,
      toggleAlarm,
      setLeadMinutes,
      setSound,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
