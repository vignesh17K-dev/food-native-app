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
}

const Password = ({ style, label, control, validations, name }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <View style={style}>
      <Controller
        control={control}
        name={name}
        rules={apply_validations({ ...validations, name, label }) as any}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <React.Fragment>
            <Text style={styles.textLabel}>{label}</Text>
            <View style={styles.inputRow}>
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
                placeholderTextColor="#666"
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
  formItemError: {
    color: "red",
    fontSize: 14,
    marginTop: SIZES.height * 0.001,
  },
});

export default Password;
