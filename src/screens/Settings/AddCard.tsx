import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import type { Control, FieldPath, RegisterOptions } from "react-hook-form";
import Header from "../../components/Header";
import Button from "../../components/Button";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppToast } from "../../context/AppToast";

type AddCardFormValues = {
  card_number: string;
  cardholder_name: string;
  expiry_date: string;
  cvv: string;
};

type CardFieldProps = {
  label: string;
  control: Control<AddCardFormValues>;
  name: FieldPath<AddCardFormValues>;
  rules?: RegisterOptions<AddCardFormValues>;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  secureTextEntry?: boolean;
  maxLength?: number;
  formatValue?: (text: string) => string;
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
  containerStyle?: object;
};

const DIGITS_ONLY = /^\d+$/;
const CARDHOLDER_NAME = /^[A-Za-z\s]+$/;

function formatDigitsOnly(text: string, maxDigits: number) {
  return text.replace(/\D/g, "").slice(0, maxDigits);
}

function formatExpiryInput(text: string) {
  const digits = formatDigitsOnly(text, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCardholderName(text: string) {
  return text.replace(/[^A-Za-z\s]/g, "");
}

function CardField({
  label,
  control,
  name,
  rules,
  placeholder,
  keyboardType = "default",
  secureTextEntry,
  maxLength,
  formatValue,
  autoCapitalize = "none",
  containerStyle,
}: CardFieldProps) {
  const { colors, darkMode } = useAppTheme();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error, isDirty } }) => {
        const showCheck = isDirty && !error && Boolean(value);

        return (
          <View style={[styles.field_wrap, containerStyle]}>
            <View
              style={[
                styles.field_box,
                { backgroundColor: colors.searchBackground },
              ]}
            >
              <Text style={[styles.field_label, { color: colors.textSecondary }]}>
                {label}
              </Text>
              <View style={styles.field_row}>
                <TextInput
                  value={value ?? ""}
                  onChangeText={(text) =>
                    onChange(formatValue ? formatValue(text) : text)
                  }
                  placeholder={placeholder}
                  placeholderTextColor={colors.placeholder}
                  keyboardType={keyboardType}
                  autoCapitalize={autoCapitalize}
                  secureTextEntry={secureTextEntry}
                  maxLength={maxLength}
                  style={[
                    styles.field_input,
                    { color: darkMode ? colors.text : colors.fieldText },
                  ]}
                />
                {showCheck ? (
                  <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                ) : (
                  <View style={styles.check_placeholder} />
                )}
              </View>
            </View>
            {error?.message ? (
              <Text style={styles.field_error}>{error.message}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

function CardPreview({
  cardNumber,
  cardholderName,
  expiryDate,
}: {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
}) {
  const displayNumber =
    cardNumber.length > 0 ? cardNumber : "1234123412341234";
  const displayName = cardholderName.trim() || "HOLDER NAME";
  const displayExpiry = expiryDate.trim() || "10/25";

  return (
    <View style={styles.card_preview}>
      <View style={styles.card_orb} />
      <Ionicons
        name="logo-apple"
        size={28}
        color="#1e3a5f"
        style={styles.card_apple}
      />
      <Text style={styles.card_preview_name}>{displayName}</Text>
      <Text style={styles.card_preview_number}>{displayNumber}</Text>
      <Text style={styles.card_preview_expiry}>{displayExpiry}</Text>
    </View>
  );
}

function AddCard({ navigation }: any) {
  const { colors } = useAppTheme();
  const toast = useAppToast();

  const { control, handleSubmit, watch, getValues, formState } =
    useForm<AddCardFormValues>({
      defaultValues: {
        card_number: "",
        cardholder_name: "",
        expiry_date: "",
        cvv: "",
      },
      mode: "onChange",
    });

  const cardNumber = watch("card_number");
  const cardholderName = watch("cardholder_name");
  const expiryDate = watch("expiry_date");


  console.log(getValues());

  const on_submit = handleSubmit(() => {
    toast.show({
      title: "Card saved locally — payment integration coming soon",
      background: "green.800",
    });
    navigation.goBack();
  });

  return (
    <SafeAreaView
      style={[styles.safe_area, { backgroundColor: colors.background }]}
    >
      <Header
        container_style={styles.header_container}
        title={
          <Text style={[styles.header_title, { color: colors.text }]}>
            ADD NEW CARD
          </Text>
        }
        left_section={
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={ImageLinks.back_arrow}
              style={[styles.back_arrow, { tintColor: colors.icon }]}
            />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll_content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CardPreview
            cardNumber={cardNumber}
            cardholderName={cardholderName}
            expiryDate={expiryDate}
          />

          <CardField
            label="Card Number"
            control={control}
            name="card_number"
            placeholder="1234123412341234"
            keyboardType="number-pad"
            maxLength={16}
            formatValue={(text) => formatDigitsOnly(text, 16)}
            rules={{
              required: "Card number is required",
              pattern: {
                value: DIGITS_ONLY,
                message: "Card number must contain digits only",
              },
              validate: (value) =>
                value.length >= 13 || "Enter a valid card number",
            }}
          />

          <CardField
            label="Cardholder Name"
            control={control}
            name="cardholder_name"
            placeholder="Holder name"
            keyboardType="default"
            autoCapitalize="words"
            formatValue={formatCardholderName}
            rules={{
              required: "Cardholder name is required",
              minLength: {
                value: 2,
                message: "Enter the name on your card",
              },
              pattern: {
                value: CARDHOLDER_NAME,
                message: "Name must contain letters only",
              },
            }}
          />

          <View style={styles.split_row}>
            <CardField
              label="Expiry Date"
              control={control}
              name="expiry_date"
              placeholder="10/25"
              keyboardType="number-pad"
              maxLength={5}
              formatValue={formatExpiryInput}
              containerStyle={styles.split_field}
              rules={{
                required: "Expiry date is required",
                pattern: {
                  value: /^\d{2}\/\d{2}$/,
                  message: "Use MM/YY format (numbers only)",
                },
                validate: (value) => {
                  const digits = value.replace(/\D/g, "");
                  return digits.length === 4 || "Enter a valid expiry date";
                },
              }}
            />
            <CardField
              label="CVV"
              control={control}
              name="cvv"
              placeholder="123"
              keyboardType="number-pad"
              maxLength={3}
              secureTextEntry
              formatValue={(text) => formatDigitsOnly(text, 3)}
              containerStyle={styles.split_field}
              rules={{
                required: "CVV is required",
                pattern: {
                  value: DIGITS_ONLY,
                  message: "CVV must contain digits only",
                },
                minLength: {
                  value: 3,
                  message: "Enter a valid CVV",
                },
                maxLength: {
                  value: 4,
                  message: "Enter a valid CVV",
                },
              }}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            text="Add Card"
            type="primary"
            width="100%"
            disabled={!formState.isValid}
            onClick={on_submit}
            style={!formState.isValid ? styles.button_disabled : undefined}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddCard;

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header_container: {
    marginRight: 18,
    marginHorizontal: SIZES.width * 0.02,
    marginVertical: 12,
  },
  header_title: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  back_arrow: {
    resizeMode: "contain",
    height: SIZES.height * 0.04,
  },
  scroll_content: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingBottom: 24,
    gap: 14,
  },
  card_preview: {
    height: SIZES.height * 0.22,
    borderRadius: 20,
    backgroundColor: "#f2815a",
    overflow: "hidden",
    padding: 20,
    marginBottom: 8,
  },
  card_orb: {
    position: "absolute",
    width: SIZES.width * 0.55,
    height: SIZES.width * 0.55,
    borderRadius: SIZES.width * 0.275,
    backgroundColor: "#f5b942",
    bottom: -SIZES.width * 0.2,
    right: -SIZES.width * 0.08,
    opacity: 0.95,
  },
  card_apple: {
    position: "absolute",
    top: 18,
    right: 20,
  },
  card_preview_name: {
    position: "absolute",
    left: 20,
    bottom: 52,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card_preview_number: {
    position: "absolute",
    left: 20,
    bottom: 28,
    color: "#fff",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  card_preview_expiry: {
    position: "absolute",
    right: 20,
    bottom: 28,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  field_wrap: {
    width: "100%",
  },
  field_box: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  field_label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  field_row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  field_input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 4,
  },
  field_error: {
    color: "#ef4444",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  check_placeholder: {
    width: 22,
  },
  split_row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  split_field: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingBottom: Platform.OS === "ios" ? 8 : 20,
    paddingTop: 12,
  },
  button_disabled: {
    opacity: 0.5,
  },
});
