import {
  Modal,
  Pressable,
  Image,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "@/constants/fonts";
import { t } from "@/lib/i18n";

type Props = {
  visible: boolean;
  source: ImageSourcePropType | null;
  title?: string;
  onClose: () => void;
};

/** Tam ekran poz fotoğrafı — dokununca kapat. */
export function PoseImageLightbox({ visible, source, title, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const imageSize = Math.min(width - 32, height * 0.62, 520);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-black/90"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={onClose}
          className="absolute inset-0"
          accessibilityRole="button"
          accessibilityLabel={t("session.close")}
        />

        <View className="z-10 mb-4 flex-row items-start justify-between px-5" pointerEvents="box-none">
          <Text
            style={{ fontFamily: fonts.bodySemi }}
            className="mr-4 flex-1 text-[17px] text-sand-50"
            numberOfLines={2}
          >
            {title ?? ""}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("session.close")}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="close" size={26} color="#ebe6dc" />
          </Pressable>
        </View>

        <View className="z-10 flex-1 items-center justify-center px-4" pointerEvents="box-none">
          {source ? (
            <Image
              source={source}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: 4,
                backgroundColor: "#f3efe6",
              }}
              resizeMode="contain"
            />
          ) : null}
          <Text
            style={{ fontFamily: fonts.body }}
            className="mt-5 text-center text-[12px] text-sand-200/55"
          >
            {t("session.poseCloseHint")}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
