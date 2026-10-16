import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppTheme } from "../hooks/useAppTheme";

interface Props {
  initial_count?: number;
  value?: number;
  onChange?: (count: number) => void;
  disable_increment?: boolean;
  disable_decrement?: boolean;
  minCount?: number;
  from_cart?: boolean;
  style?: any;
}

const Counter = ({
  initial_count = 1,
  value,
  onChange,
  disable_increment,
  disable_decrement,
  minCount = 1,
  from_cart = false,
  style,
}: Props) => {
  const { colors, darkMode } = useAppTheme();
  const is_controlled = value !== undefined;
  const [internal_count, set_internal_count] = useState(initial_count);
  const count = is_controlled ? value : internal_count;
  const disabled_decrement = count <= minCount || disable_decrement;

  useEffect(() => {
    if (!is_controlled) {
      set_internal_count(initial_count);
    }
  }, [initial_count, is_controlled]);

  const update_count = (next_count: number) => {
    if (!is_controlled) {
      set_internal_count(next_count);
    }
    onChange?.(next_count);
  };

  const icon_size = from_cart ? 25 : 30;
  const count_color = from_cart ? colors.fieldText : colors.text;
  const icon_disabled = darkMode
    ? "rgba(0, 0, 0, 0.2)"
    : "rgba(0, 0, 0, 0.12)";
  const minus_enabled = from_cart ? colors.textSecondary : "grey";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        from_cart && [
          styles.container_cart,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ],
        style,
      ]}
    >
      <TouchableOpacity
        disabled={disabled_decrement}
        onPress={() => {
          if (disabled_decrement) return;
          update_count(Math.max(minCount, count - 1));
        }}
      >
        <MaterialCommunityIcons
          name="minus"
          color={disabled_decrement ? icon_disabled : minus_enabled}
          size={icon_size}
        />
      </TouchableOpacity>

      <View style={[styles.count_box, from_cart && styles.count_box_cart]}>
        <Text
          style={[
            styles.count_text,
            { color: count_color },
            from_cart && styles.count_text_cart,
          ]}
        >
          {count}
        </Text>
      </View>

      <TouchableOpacity
        disabled={disable_increment}
        onPress={() => update_count(count + 1)}
      >
        <MaterialCommunityIcons
          name="plus"
          color={disable_increment ? icon_disabled : "#ed7550"}
          size={icon_size}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgb(246,246,248)",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    gap: 6,
    justifyContent: "center",
  },
  count_box: {
    minWidth: 60,
    alignItems: "center",
  },
  count_text: {
    fontSize: 26,
    fontWeight: "800",
  },
  container_cart: {
    padding: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  count_box_cart: {
    minWidth: 45,
  },
  count_text_cart: {
    fontSize: 20,
    fontWeight: "700",
  },
});

export default Counter;
