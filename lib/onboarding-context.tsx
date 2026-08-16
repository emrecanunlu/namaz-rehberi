import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_STORAGE_KEY } from "@/data/onboarding";

type OnboardingContextValue = {
  ready: boolean;
  seenOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [seenOnboarding, setSeenOnboarding] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!active) return;
      setSeenOnboarding(value === "1");
      setReady(true);
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    setSeenOnboarding(true);
  }, []);

  const value = useMemo(
    () => ({ ready, seenOnboarding, completeOnboarding }),
    [ready, seenOnboarding, completeOnboarding],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
