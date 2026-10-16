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

  return (
    <View style={style}>
      <Controller
        control={control}
        name={name}
        rules={apply_validations({ ...validations, name, label }) as any}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <React.Fragment>
            <Text
              style={[styles.textLabel, is_account && styles.textLabelAccount]}
            >
              {label}
            </Text>
            <View
              style={[styles.inputRow, is_account && styles.inputRowAccount]}
            >
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ""}
                style={styles.inputFieldStyle}
                secureTextEntry={!show}
                autoCapitalize="none"
                returnKeyType="next"
                autoComplete="password"
                autoCorrect={false}
                textContentType="password"
                placeholderTextColor="#b0b0b0"
              />
              <Pressable
                onPress={() => setShow(!show)}
                style={styles.visibilityButton}
                hitSlop={8}
              >
                <MaterialIcons
                  name={show ? "visibility" : "visibility-off"}
                  size={22}
                  color="#666"
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
    borderWidth: 0.6,
    borderColor: "transparent",
    backgroundColor: "rgb(211, 211, 211)",
    paddingHorizontal: 10,
  },
  inputRowAccount: {
    backgroundColor: "#fff",
    borderWidth: 0,
  },
  inputFieldStyle: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 8,
  },
  visibilityButton: {
    paddingLeft: 8,
  },
  textLabel: {
    marginVertical: SIZES.height * 0.01,
    opacity: 0.6,
    fontSize: 16,
  },
  textLabelAccount: {
    opacity: 1,
    color: "#8a8a8a",
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
