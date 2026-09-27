import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

type Props = {
  open: boolean;
  children: ReactNode;
};

/**
 * Accordion paneli — yalnızca RN Animated (Reanimated/worklets yok).
 * Expo Go’da Reanimated layout/entering animasyonları SIGSEGV üretebiliyor.
 */
export function Collapsible({ open, children }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    opacity.setValue(0);
    translateY.setValue(6);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, opacity, translateY, reduceMotion]);

  if (!open) return null;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
