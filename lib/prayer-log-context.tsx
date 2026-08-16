import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PrayerSectionKind } from "@/data/content";
import { dateKey } from "@/lib/prayer-times";
import {
  buildDayReports,
  completedPrayerIdsForDate,
  isPrayerDone,
  isSectionDone,
  loadPrayerLog,
  markSectionInList,
  rakatsForPrayerOnDate,
  savePrayerLog,
  sectionProgressForPrayer,
  togglePrayerManualInList,
  toggleSectionManualInList,
  totalRakatsForDate,
  type DayReport,
  type PrayerGuideId,
  type PrayerLogEntry,
} from "@/lib/prayer-log";

type PrayerLogContextValue = {
  ready: boolean;
  entries: PrayerLogEntry[];
  todayKey: string;
  todayRakats: number;
  todayCompletedIds: PrayerGuideId[];
  isPrayerDoneToday: (prayerId: PrayerGuideId) => boolean;
  isSectionDoneToday: (
    prayerId: PrayerGuideId,
    section: PrayerSectionKind,
  ) => boolean;
  todayPrayerRakats: (prayerId: PrayerGuideId) => number;
  todaySectionProgress: (prayerId: PrayerGuideId) => {
    done: number;
    total: number;
  };
  markSectionGuided: (
    prayerId: PrayerGuideId,
    section: PrayerSectionKind,
  ) => Promise<void>;
  toggleSectionManual: (
    prayerId: PrayerGuideId,
    section: PrayerSectionKind,
  ) => Promise<void>;
  togglePrayerManual: (prayerId: PrayerGuideId) => Promise<void>;
  dayReports: DayReport[];
};

const PrayerLogContext = createContext<PrayerLogContextValue | null>(null);

export function PrayerLogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState<PrayerLogEntry[]>([]);
  const [todayKey, setTodayKey] = useState(() => dateKey());

  useEffect(() => {
    let active = true;
    void (async () => {
      const loaded = await loadPrayerLog();
      if (!active) return;
      setEntries(loaded);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Gece yarısı geçince bugün anahtarını yenile
  useEffect(() => {
    const id = setInterval(() => {
      const next = dateKey();
      setTodayKey((prev) => (prev === next ? prev : next));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const markSectionGuided = useCallback(
    async (prayerId: PrayerGuideId, section: PrayerSectionKind) => {
      setEntries((prev) => {
        const next = markSectionInList(prev, prayerId, section, "guided");
        if (next !== prev) {
          void savePrayerLog(next);
        }
        return next;
      });
    },
    [],
  );

  const togglePrayerManual = useCallback(async (prayerId: PrayerGuideId) => {
    setEntries((prev) => {
      const next = togglePrayerManualInList(prev, prayerId);
      void savePrayerLog(next);
      return next;
    });
  }, []);

  const toggleSectionManual = useCallback(
    async (prayerId: PrayerGuideId, section: PrayerSectionKind) => {
      setEntries((prev) => {
        const next = toggleSectionManualInList(prev, prayerId, section);
        void savePrayerLog(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo<PrayerLogContextValue>(
    () => ({
      ready,
      entries,
      todayKey,
      todayRakats: totalRakatsForDate(entries, todayKey),
      todayCompletedIds: completedPrayerIdsForDate(entries, todayKey),
      isPrayerDoneToday: (prayerId) =>
        isPrayerDone(entries, todayKey, prayerId),
      isSectionDoneToday: (prayerId, section) =>
        isSectionDone(entries, todayKey, prayerId, section),
      todayPrayerRakats: (prayerId) =>
        rakatsForPrayerOnDate(entries, todayKey, prayerId),
      todaySectionProgress: (prayerId) =>
        sectionProgressForPrayer(entries, todayKey, prayerId),
      markSectionGuided,
      toggleSectionManual,
      togglePrayerManual,
      dayReports: buildDayReports(entries, 60),
    }),
    [
      ready,
      entries,
      todayKey,
      markSectionGuided,
      toggleSectionManual,
      togglePrayerManual,
    ],
  );

  return (
    <PrayerLogContext.Provider value={value}>
      {children}
    </PrayerLogContext.Provider>
  );
}

export function usePrayerLog() {
  const ctx = useContext(PrayerLogContext);
  if (!ctx) {
    throw new Error("usePrayerLog must be used within PrayerLogProvider");
  }
  return ctx;
}
