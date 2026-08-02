import type { ImageSourcePropType } from "react-native";

export type PrayerPoseId =
  | "niyet"
  | "tekbir"
  | "kiyam"
  | "ruku"
  | "kavme"
  | "secde"
  | "oturma"
  | "teshehhud"
  | "kunut"
  | "selam";

export const PRAYER_POSE_IDS: PrayerPoseId[] = [
  "niyet",
  "tekbir",
  "kiyam",
  "ruku",
  "kavme",
  "secde",
  "oturma",
  "teshehhud",
  "kunut",
  "selam",
];

export const PRAYER_POSE_IMAGES: Record<PrayerPoseId, ImageSourcePropType> = {
  niyet: require("../assets/images/prayer-steps/niyet.png"),
  tekbir: require("../assets/images/prayer-steps/tekbir.png"),
  kiyam: require("../assets/images/prayer-steps/kiyam.png"),
  ruku: require("../assets/images/prayer-steps/ruku.png"),
  kavme: require("../assets/images/prayer-steps/kavme.png"),
  secde: require("../assets/images/prayer-steps/secde.png"),
  oturma: require("../assets/images/prayer-steps/oturma.png"),
  teshehhud: require("../assets/images/prayer-steps/teshehhud.png"),
  kunut: require("../assets/images/prayer-steps/kunut.png"),
  selam: require("../assets/images/prayer-steps/selam.png"),
};

export const DUA_CARD_IMAGE: ImageSourcePropType = require("../assets/images/duas/card.png");
