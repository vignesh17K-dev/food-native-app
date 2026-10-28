import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../hooks/useAppTheme";
import constants from "../../utils/constants";
import { ACCENT } from "../../utils/theme/appTheme";

const OrderStatusBanner = () => {
  const { colors, darkMode } = useAppTheme();
  const navigation: any = useNavigation();

  const handle_press = () => {
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate(constants.route_names.DeliveryStatus);
      return;
    }
    navigation.navigate(constants.route_names.DeliveryStatus);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handle_press}
      style={[
        styles.banner,
        {
          backgroundColor: darkMode ? colors.accentSoft : "#fff3ee",
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={[styles.icon_wrap, { backgroundColor: ACCENT }]}>
        <MaterialCommunityIcons name="moped" size={18} color="#fff" />
      </View>
      <View style={styles.text_wrap}>
        <Text style={[styles.title, { color: colors.text }]}>
          Order on the way
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tap to track delivery
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

export default OrderStatusBanner;

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12
  },
  icon_wrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  text_wrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
});
