import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import { SIZES } from "../../constants";
import { MaterialIcons } from "@expo/vector-icons";
import apply_validations from "../../utils/rules";
import { Controller } from "react-hook-form";
import { useAppTheme } from "../hooks/useAppTheme";

interface Props {
  style?: any;
  name: string;
  validations: any;
  label: string;
  control: any;
  variant?: "default" | "account";
}

const Password = ({
  style,
  label,
  control,
  validations,
  name,
  variant = "default",
}: Props) => {
  const is_account = variant === "account";
  const [show, setShow] = useState(false);
  const { colors, darkMode } = useAppTheme();

  return (
    <View style={style}>
      <Controller
        control={control}
        name={name}
        rules={apply_validations({ ...validations, name, label }) as any}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: is_account
                    ? colors.surfaceElevated
                    : colors.inputMuted,
                  opacity: 1,
                  borderColor: is_account || darkMode ? colors.border : "transparent",
                  borderWidth: is_account || darkMode ? StyleSheet.hairlineWidth : 0,
                },
              ]}
            >
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ""}
                style={[styles.inputFieldStyle, { color: colors.fieldText }]}
                secureTextEntry={!show}
                autoCapitalize="none"
                returnKeyType="next"
                autoComplete="password"
                autoCorrect={false}
                textContentType="password"
                placeholderTextColor={colors.fieldPlaceholder}
              />
              <Pressable
                onPress={() => setShow(!show)}
                style={styles.visibilityButton}
                hitSlop={8}
              >
                <MaterialIcons
                  name={show ? "visibility" : "visibility-off"}
                  size={22}
                  color={darkMode ? colors.fieldPlaceholder : colors.fieldText}
                />
              </Pressable>
            </View>

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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.height * 0.055,
    borderRadius: 10,
    borderWidth: 0,
    paddingHorizontal: 10,
  },
  inputFieldStyle: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  visibilityButton: {
    paddingLeft: 8,
  },
  textLabel: {
    marginVertical: SIZES.height * 0.01,
    opacity: 0.5,
    fontWeight: "500",
    fontSize: 16,
  },
  textLabelAccount: {
    opacity: 1,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 4,
  },
  formItemError: {
    color: "red",
    fontSize: 14,
    marginTop: SIZES.height * 0.001,
  },
});

export default Password;
