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
  niyet: require("../assets/images/prayer-steps/niyet.jpg"),
  tekbir: require("../assets/images/prayer-steps/tekbir.jpg"),
  kiyam: require("../assets/images/prayer-steps/kiyam.jpg"),
  ruku: require("../assets/images/prayer-steps/ruku.jpg"),
  kavme: require("../assets/images/prayer-steps/kavme.jpg"),
  secde: require("../assets/images/prayer-steps/secde.jpg"),
  oturma: require("../assets/images/prayer-steps/oturma.jpg"),
  teshehhud: require("../assets/images/prayer-steps/teshehhud.jpg"),
  kunut: require("../assets/images/prayer-steps/kunut.jpg"),
  selam: require("../assets/images/prayer-steps/selam.jpg"),
};
