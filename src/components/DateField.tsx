import React from "react";
import { StyleSheet, Text, ViewStyle } from "react-native";
import { SIZES } from "../../constants";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import apply_validations from "../../utils/rules";
import {
  formatDateOnlyIso,
  parseDateOnly,
} from "../../utils/account/profileHelpers";
import DatePickerField from "./DatePickerField";

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  validations?: Record<string, unknown>;
  placeholder?: string;
  style?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  variant?: "default" | "account";
};

const DateField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  validations,
  placeholder,
  style,
  minimumDate,
  maximumDate,
  disabled,
  variant = "account",
}: Props<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={
        apply_validations({
          ...validations,
          name: name as string,
          label,
        }) as RegisterOptions<TFieldValues, FieldPath<TFieldValues>>
      }
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <DatePickerField
            label={label}
            placeholder={placeholder}
            value={parseDateOnly(typeof value === "string" ? value : null)}
            onChange={(date) => onChange(formatDateOnlyIso(date))}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            disabled={disabled}
            style={style}
            variant={variant}
          />
          {error ? (
            <Text style={styles.formItemError}>{error.message}</Text>
          ) : null}
        </>
      )}
    />
  );
};

const styles = StyleSheet.create({
  formItemError: {
    color: "red",
    fontSize: 14,
    marginTop: SIZES.height * 0.001,
  },
});

export default DateField;
