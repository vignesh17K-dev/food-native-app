import React from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";
import { SIZES } from "../../constants";
import { Controller } from "react-hook-form";
import apply_validations from "../../utils/rules";
import { useAppTheme } from "../hooks/useAppTheme";

interface Props {
  style?: any;
  name: string;
  validations?: any;
  label: string;
  control: any;
  placeholder?: string;
  variant?: "default" | "account";
  multiline?: boolean;
}

const InputField = ({
  style,
  name,
  validations,
  label,
  control,
  placeholder,
  variant = "default",
  multiline = false,
}: Props) => {
  const is_account = variant === "account";
  const { colors, darkMode } = useAppTheme();

  return (
    <View style={style}>
      <Controller
        control={control}
        name={name}
        rules={apply_validations({ ...validations, name, label })}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <React.Fragment>
            <Text
              style={[
                styles.textLabel,
                is_account && styles.textLabelAccount,
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
            <TextInput
              autoComplete="off"
              autoCapitalize="none"
              value={value ?? ""}
              placeholder={placeholder}
              placeholderTextColor={colors.fieldPlaceholder}
              onChangeText={onChange}
              multiline={multiline}
              textAlignVertical={multiline ? "top" : "center"}
              style={{
                height: multiline ? SIZES.height * 0.12 : SIZES.height * 0.055,
                borderRadius: 10,
                borderColor: "transparent",
                fontSize: 16,
                color: colors.fieldText,
                borderWidth: 0,
                padding: 10,
                marginBottom: 1,
                backgroundColor: is_account
                  ? colors.surfaceElevated
                  : colors.inputMuted,
                opacity: 1,
              }}
            />

            {error && (
              <Text style={styles.formItemError}>
                {error?.message || "error"}
              </Text>
            )}
          </React.Fragment>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formItemError: {
    color: "red",
    fontSize: 14,
    marginTop: SIZES.height * 0.001,
  },
  textLabel: {
    marginVertical: SIZES.height * 0.01,
    opacity: 0.5,
    fontWeight: '500',
    fontSize: 16,
  },
  textLabelAccount: {
    opacity: 1,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 4,
  },
});

export default InputField;
