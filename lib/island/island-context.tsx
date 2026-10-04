import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { completedPrayerIdsForDate } from "@/lib/prayer-log";
import { usePrayerLog } from "@/lib/prayer-log-context";
import type { TaskLog } from "@/lib/island/daily-tasks";
import {
  STAGES_PER_ISLAND,
  computeProgress,
  nurToReachLevel,
  plantKindForSeed,
  withBonusNur,
  type DayActivity,
  type IslandProgress,
  type Plant,
} from "@/lib/island/progress";

const STORAGE_KEY = "namaz_rehberi_island_v1";
const DEV_STORAGE_KEY = "namaz_rehberi_island_dev_v1";

/** Geliştirme hızlandırıcısı — yalnız __DEV__ derlemelerinde etkili */
type DevBoost = { nur: number; seeds: number; growDays: number };
const NO_BOOST: DevBoost = { nur: 0, seeds: 0, growDays: 0 };

export type IslandDevActions = {
  boost: DevBoost;
  addLevel: () => void;
  addIsland: () => void;
  addSeed: () => void;
  growPlants: () => void;
  reset: () => void;
};

type StoredIsland = {
  /** Günlük görevler şimdilik kapalı (docs/ADA.md); kayıt alanı ileride açılınca kullanılacak */
  taskLog: TaskLog;
  plants: Plant[];
  /** Kullanıcının adada en son gördüğü seviye — yeni öğeler bundan büyükse belirerek gelir */
  lastSeenLevel: number;
  /** Ambiyans müziği ve efektler */
  soundOn: boolean;
};

const EMPTY: StoredIsland = { taskLog: {}, plants: [], lastSeenLevel: 0, soundOn: true };

type IslandContextValue = {
  ready: boolean;
  progress: IslandProgress;
  todayKey: string;
  todayPrayers: number;
  plants: Plant[];
  seedsAvailable: number;
  /** Günlerden hangilerinde en az bir namaz kılındı (bitkiler bu günlerde büyür) */
  wateredDates: ReadonlySet<string>;
  plantSeed: (spot: { x: number; z: number }) => Plant | null;
  lastSeenLevel: number;
  markLevelSeen: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  /** Bitkiler için ek büyüme günü (yalnız geliştirme) */
  growBonus: number;
  dev: IslandDevActions | null;
};

const IslandContext = createContext<IslandContextValue | null>(null);

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function IslandProvider({ children }: { children: ReactNode }) {
  const { entries, todayKey, ready: logReady } = usePrayerLog();
  const [stored, setStored] = useState<StoredIsland>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [boost, setBoost] = useState<DevBoost>(NO_BOOST);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && active) setStored({ ...EMPTY, ...JSON.parse(raw) });
        if (__DEV__) {
          const devRaw = await AsyncStorage.getItem(DEV_STORAGE_KEY);
          if (devRaw && active) setBoost({ ...NO_BOOST, ...JSON.parse(devRaw) });
        }
      } catch {
        // bozuk kayıt: boş adayla devam
      }
      if (active) setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((fn: (prev: StoredIsland) => StoredIsland) => {
    setStored((prev) => {
      const next = fn(prev);
      if (next !== prev) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const { days, wateredDates } = useMemo(() => {
    const dates = new Set<string>(entries.map((e) => e.date));
    const list: DayActivity[] = [];
    const watered = new Set<string>();
    for (const date of dates) {
      const prayers = completedPrayerIdsForDate(entries, date).length;
      if (prayers > 0) {
        watered.add(date);
        list.push({ date, prayers, tasks: 0 });
      }
    }
    return { days: list, wateredDates: watered as ReadonlySet<string> };
  }, [entries]);

  const progress = useMemo(() => {
    const base = computeProgress(days, todayKey);
    if (!__DEV__ || (boost.nur === 0 && boost.seeds === 0)) return base;
    const boosted = withBonusNur(base, boost.nur);
    return { ...boosted, seedsEarned: boosted.seedsEarned + boost.seeds };
  }, [days, todayKey, boost.nur, boost.seeds]);
  const todayPrayers = useMemo(
    () => completedPrayerIdsForDate(entries, todayKey).length,
    [entries, todayKey],
  );

  const seedsAvailable = Math.max(0, progress.seedsEarned - stored.plants.length);

  const plantSeed = useCallback(
    (spot: { x: number; z: number }) => {
      if (seedsAvailable <= 0) return null;
      const plant: Plant = {
        id: uid(),
        kind: plantKindForSeed(stored.plants.length),
        island: progress.island,
        x: spot.x,
        z: spot.z,
        plantedOn: todayKey,
      };
      update((prev) => ({ ...prev, plants: [...prev.plants, plant] }));
      return plant;
    },
    [seedsAvailable, stored.plants.length, progress.island, todayKey, update],
  );

  const markLevelSeen = useCallback(() => {
    update((prev) =>
      prev.lastSeenLevel === progress.level ? prev : { ...prev, lastSeenLevel: progress.level },
    );
  }, [progress.level, update]);

  const toggleSound = useCallback(() => {
    update((prev) => ({ ...prev, soundOn: !prev.soundOn }));
  }, [update]);

  const updateBoost = useCallback((fn: (prev: DevBoost) => DevBoost) => {
    setBoost((prev) => {
      const next = fn(prev);
      void AsyncStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const dev = useMemo<IslandDevActions | null>(() => {
    if (!__DEV__) return null;
    const jumpTo = (level: number) =>
      updateBoost((b) => ({ ...b, nur: b.nur + nurToReachLevel(progress.nur, level) }));
    return {
      boost,
      addLevel: () => jumpTo(progress.level + 1),
      addIsland: () => jumpTo((progress.island + 1) * STAGES_PER_ISLAND),
      addSeed: () => updateBoost((b) => ({ ...b, seeds: b.seeds + 1 })),
      growPlants: () => updateBoost((b) => ({ ...b, growDays: b.growDays + 1 })),
      reset: () => {
        updateBoost(() => NO_BOOST);
        update((prev) => ({ ...prev, plants: [], lastSeenLevel: 0 }));
      },
    };
  }, [boost, progress.nur, progress.level, progress.island, update, updateBoost]);

  const value = useMemo<IslandContextValue>(
    () => ({
      ready: loaded && logReady,
      progress,
      todayKey,
      todayPrayers,
      plants: stored.plants,
      seedsAvailable,
      wateredDates,
      plantSeed,
      lastSeenLevel: stored.lastSeenLevel,
      markLevelSeen,
      soundOn: stored.soundOn,
      toggleSound,
      growBonus: __DEV__ ? boost.growDays : 0,
      dev,
    }),
    [
      loaded,
      logReady,
      progress,
      todayKey,
      todayPrayers,
      stored,
      seedsAvailable,
      wateredDates,
      plantSeed,
      markLevelSeen,
      boost.growDays,
      dev,
      toggleSound,
    ],
  );

  return <IslandContext.Provider value={value}>{children}</IslandContext.Provider>;
}

export function useIsland() {
  const ctx = useContext(IslandContext);
  if (!ctx) throw new Error("useIsland must be used within IslandProvider");
  return ctx;
}
