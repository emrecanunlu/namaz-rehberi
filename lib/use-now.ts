import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useIsFocused } from "expo-router";

/**
 * Periyodik "şimdi" — yalnız ekran odaktayken ve uygulama öndeyken tik atar.
 * Tikler aralık sınırına hizalanır (1000 → saniye başı, 60_000 → dakika başı).
 * `wakeAt` verilirse o anda da bir kez güncellenir (ör. vakit girişi).
 */
export function useNow(intervalMs: number, wakeAt?: Date | null) {
  const focused = useIsFocused();
  const [appActive, setAppActive] = useState(
    AppState.currentState === "active",
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setAppActive(state === "active");
    });
    return () => sub.remove();
  }, []);

  const running = focused && appActive;

  useEffect(() => {
    if (!running) return;
    setNow(new Date());
    let id: ReturnType<typeof setTimeout>;
    const schedule = () => {
      id = setTimeout(
        () => {
          setNow(new Date());
          schedule();
        },
        intervalMs - (Date.now() % intervalMs),
      );
    };
    schedule();
    return () => clearTimeout(id);
  }, [running, intervalMs]);

  const wakeTime = wakeAt?.getTime();
  useEffect(() => {
    if (!running || wakeTime == null) return;
    const delay = wakeTime - Date.now();
    if (delay <= 0) return;
    const id = setTimeout(() => setNow(new Date()), delay + 50);
    return () => clearTimeout(id);
  }, [running, wakeTime]);

  return now;
}
