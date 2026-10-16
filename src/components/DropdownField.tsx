import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { SIZES } from "../../constants";
import apply_validations from "../../utils/rules";

export type DropdownOption = {
  label: string;
  value: string;
};

type Props = {
  name: string;
  control: any;
  label: string;
  options: DropdownOption[];
  validations?: any;
  style?: any;
  placeholder?: string;
};

const DropdownField = ({
  name,
  control,
  label,
  options,
  validations,
  style,
  placeholder = "Select gender",
}: Props) => {
  const [open, set_open] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      rules={apply_validations({ ...validations, name, label })}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selected = options.find((opt) => opt.value === value);
        const display = selected?.label ?? placeholder;
        const has_value = Boolean(selected);

        return (
          <View style={style}>
            <Text style={styles.label}>{label}</Text>
            <Pressable style={styles.field} onPress={() => set_open(true)}>
              <Text
                style={[
                  styles.field_text,
                  !has_value && styles.placeholder_text,
                ]}
              >
                {display}
              </Text>
              <Feather name="chevron-down" size={22} color="#b0b0b0" />
            </Pressable>
            {error && (
              <Text style={styles.formItemError}>{error.message}</Text>
            )}

            <Modal visible={open} transparent animationType="fade">
              <Pressable style={styles.backdrop} onPress={() => set_open(false)}>
                <View style={styles.sheet}>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.option_row}
                      onPress={() => {
                        onChange(option.value);
                        set_open(false);
                      }}
                    >
                      <Text style={styles.option_text}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>
        );
      }}
    />
  );
};

export default DropdownField;

const styles = StyleSheet.create({
  label: {
    color: "#8a8a8a",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 4,
  },
  field: {
    height: SIZES.height * 0.055,
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  field_text: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  placeholder_text: {
    color: "#b0b0b0",
  },
  formItemError: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  option_row: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  option_text: {
    fontSize: 16,
    color: "#1a1a1a",
  },
});
