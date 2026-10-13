import React from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";
import { SIZES } from "../../constants";
import { Controller } from "react-hook-form";
import apply_validations from "../../utils/rules";

interface Props {
  style?: any;
  name: string;
  validations?: any;
  label: string;
  control: any;
  placeholder?: string;
}

const InputField = ({
  style,
  name,
  validations,
  label,
  control,
  placeholder,
}: Props) => {
  return (
    <View style={style}>
      <Controller
        control={control}
        name={name}
        rules={apply_validations({ ...validations, name, label }) as any}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <React.Fragment>
            <Text style={styles.textLabel}>{label}</Text>
            <TextInput
              autoComplete="off"
              autoCapitalize="none"
              value={value ?? ""}
              placeholder={placeholder}
              onChangeText={onChange}
              style={{
                height: SIZES.height * 0.055,
                borderRadius: 10,
                borderColor: "transparent",
                fontSize: 16,
                ...styles.inputFieldStyle,
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
  inputFieldStyle: {
    backgroundColor: "rgb(211, 211, 211)",
    opacity: 0.4,
    color: "black",
    borderWidth: 1,
    padding: 10,
    marginBottom: 1,
  },
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
});

export default InputField;
