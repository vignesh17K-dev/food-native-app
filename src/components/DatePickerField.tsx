import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { SIZES } from "../../constants";
import { useAppTheme } from "../hooks/useAppTheme";

export type DatePickerFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "default" | "account";
};

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const DatePickerField = ({
  value,
  onChange,
  label,
  placeholder = "Select date",
  minimumDate,
  maximumDate,
  disabled = false,
  style,
  variant = "default",
}: DatePickerFieldProps) => {
  const is_account = variant === "account";
  const { colors, darkMode } = useAppTheme();
  const [android_visible, set_android_visible] = useState(false);
  const [ios_visible, set_ios_visible] = useState(false);
  const [ios_draft, set_ios_draft] = useState<Date>(value ?? new Date());

  useEffect(() => {
    if (ios_visible) {
      set_ios_draft(value ?? new Date());
    }
  }, [ios_visible, value]);

  const open_picker = () => {
    if (disabled) {
      return;
    }
    if (Platform.OS === "android") {
      set_android_visible(true);
    } else {
      set_ios_visible(true);
    }
  };

  const handle_android_change = (event: DateTimePickerEvent, date?: Date) => {
    set_android_visible(false);
    if (event.type === "set" && date) {
      onChange(date);
    }
  };

  const handle_ios_done = () => {
    onChange(ios_draft);
    set_ios_visible(false);
  };

  const handle_ios_cancel = () => {
    set_ios_visible(false);
  };

  const display_text = value ? formatDisplayDate(value) : placeholder;
  const has_value = Boolean(value);

  return (
    <View style={style}>
      {label ? (
        <Text
          style={[
            styles.label,
            is_account && styles.label_account,
            {
              color: darkMode
                ? colors.fieldLabel
                : is_account
                  ? colors.textSecondary
                  : undefined,
              opacity: darkMode || is_account ? 1 : undefined,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={open_picker}
        disabled={disabled}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: is_account
              ? colors.surfaceElevated
              : colors.inputMuted,
            opacity: darkMode || is_account ? 1 : 0.4,
            borderWidth: darkMode || is_account ? StyleSheet.hairlineWidth : 0,
            borderColor: colors.border,
          },
          disabled && styles.field_disabled,
          pressed && !disabled && styles.field_pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
      >
        <Text
          style={[
            styles.field_text,
            { color: has_value ? colors.fieldText : colors.fieldPlaceholder },
            disabled && styles.field_text_disabled,
          ]}
        >
          {display_text}
        </Text>
        <Feather
          name="calendar"
          size={20}
          color={disabled ? colors.fieldPlaceholder : colors.fieldPlaceholder}
        />
      </Pressable>

      {Platform.OS === "android" && android_visible ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handle_android_change}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal visible={ios_visible} transparent animationType="slide">
          <Pressable style={styles.backdrop} onPress={handle_ios_cancel}>
            <Pressable
              style={[styles.ios_sheet, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => {}}
            >
              <View style={[styles.ios_toolbar, { borderBottomColor: colors.border }]}>
                <Pressable onPress={handle_ios_cancel} hitSlop={8}>
                  <Text style={styles.ios_toolbar_action}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handle_ios_done} hitSlop={8}>
                  <Text style={[styles.ios_toolbar_action, styles.ios_done]}>
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={ios_draft}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={(_, date) => {
                  if (date) {
                    set_ios_draft(date);
                  }
                }}
                themeVariant={darkMode ? "dark" : "light"}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
};

export default DatePickerField;

const styles = StyleSheet.create({
  label: {
    marginVertical: SIZES.height * 0.01,
    opacity: 0.5,
    fontWeight: "500",
    fontSize: 16,
  },
  label_account: {
    opacity: 1,
    color: "#8a8a8a",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 4,
  },
  field: {
    height: SIZES.height * 0.055,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  field_default: {
    backgroundColor: "rgb(211, 211, 211)",
    opacity: 0.4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  field_account: {
    backgroundColor: "#fff",
    opacity: 1,
  },
  field_disabled: {
    opacity: 0.55,
  },
  field_pressed: {
    opacity: 0.85,
  },
  field_text: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  field_text_disabled: {
    color: "#9a9a9a",
  },
  placeholder_text: {
    color: "#b0b0b0",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  ios_sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  ios_toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e8e8e8",
  },
  ios_toolbar_action: {
    fontSize: 17,
    color: "#007aff",
  },
  ios_done: {
    fontWeight: "600",
  },
});
