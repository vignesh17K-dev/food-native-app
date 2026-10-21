import React, { ReactNode } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageLinks from "../../assets/ImageLink";
import {
  formatExpiryMmYy,
  type SavedCard,
} from "../../utils/api/payment";
import { ACCENT } from "../../utils/theme/appTheme";
import { useAppTheme } from "../hooks/useAppTheme";

export function brandIcon(brand: string) {
  const normalized = brand.trim().toLowerCase();
  if (normalized === "visa") {
    return ImageLinks.visa_card;
  }
  if (normalized === "mastercard" || normalized === "master card") {
    return ImageLinks.master_card;
  }
  return ImageLinks.credit_card;
}

type Props = {
  card: SavedCard;
  selected?: boolean;
  onPress?: () => void;
  rightSlot?: ReactNode;
};

function SavedPaymentCardRow({
  card,
  selected = false,
  onPress,
  rightSlot,
}: Props) {
  const { colors, darkMode } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.row,
        {
          borderColor: selected
            ? ACCENT
            : darkMode
              ? "rgba(0,0,0,0.18)"
              : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <Image
        source={brandIcon(card.brand)}
        style={styles.brand_icon}
        resizeMode="contain"
        accessibilityLabel={card.brand}
      />
      <View style={styles.info}>
        <Text style={[styles.number, { color: colors.fieldText }]}>
          •••• •••• •••• {card.last4}
        </Text>
        <Text style={[styles.expiry, { color: colors.textSecondary }]}>
          Expires {formatExpiryMmYy(card.expiryMonth, card.expiryYear)}
        </Text>
      </View>
      {rightSlot}
    </TouchableOpacity>
  );
}

export default SavedPaymentCardRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 12,
  },
  brand_icon: {
    width: 52,
    height: 34,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  number: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  expiry: {
    fontSize: 13,
  },
});
