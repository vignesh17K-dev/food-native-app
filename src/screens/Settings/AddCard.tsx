import React, { useState } from "react";
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
import { RouteProp, useRoute } from "@react-navigation/native";
import paymentCards, {
  buildAddCardPayload,
  formatExpiryMmYy,
  parseCardExpiry,
  type CardBrand,
} from "../../../utils/api/payment";
import type { RootStackParamList } from "../../routes";

function apiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") {
    return error;
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

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
  let digits = formatDigitsOnly(text, 4);

  // Keep month in 01–12 while typing (MM/YY).
  if (digits.length >= 1) {
    const first = Number(digits[0]);
    if (first > 1) {
      digits = `0${digits}`.slice(0, 4);
    }
  }
  if (digits.length >= 2) {
    const month = Number(digits.slice(0, 2));
    if (month === 0) {
      digits = `01${digits.slice(2)}`;
    } else if (month > 12) {
      digits = `12${digits.slice(2)}`;
    }
  }

  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function displayExpiryOnCard(expiryDate: string) {
  const parsed = parseCardExpiry(expiryDate);
  if (parsed) {
    return formatExpiryMmYy(parsed.expiryMonth, parsed.expiryYear);
  }
  return expiryDate.trim() || "MM/YY";
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

function brandPreviewIcon(brand: CardBrand) {
  if (brand === "Mastercard") {
    return ImageLinks.master_card;
  }
  return ImageLinks.visa_card;
}

function CardPreview({
  cardNumber,
  cardholderName,
  expiryDate,
  brand,
}: {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  brand: CardBrand;
}) {
  const displayNumber =
    cardNumber.length > 0 ? cardNumber : "1234123412341234";
  const displayName = cardholderName.trim() || "HOLDER NAME";
  const displayExpiry = displayExpiryOnCard(expiryDate);
  const isVisa = brand === "Visa";

  return (
    <View
      style={[
        styles.card_preview,
        isVisa ? styles.card_preview_visa : styles.card_preview_mastercard,
      ]}
    >
      <View
        style={[
          styles.card_orb,
          isVisa ? styles.card_orb_visa : styles.card_orb_mastercard,
        ]}
      />
      <Image
        source={brandPreviewIcon(brand)}
        style={[
          styles.card_brand_icon,
          isVisa ? styles.card_brand_icon_left : styles.card_brand_icon_right,
        ]}
        resizeMode="contain"
        accessibilityLabel={brand}
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
  const route = useRoute<RouteProp<RootStackParamList, "addcard">>();
  const brand: CardBrand = route.params?.brand ?? "Visa";
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, formState } =
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

  const on_submit = handleSubmit(async (values) => {
    const payload = buildAddCardPayload(
      values.card_number,
      values.expiry_date,
      brand,
    );
    if (!payload) {
      toast.show({
        title: "Invalid card details",
        background: "red.800",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await paymentCards.add_card(payload);
      toast.show({
        title: response?.message ?? "Card added successfully",
        background: "green.800",
      });
      navigation.goBack();
    } catch (error) {
      toast.show({
        title: apiErrorMessage(error, "Failed to add card"),
        background: "red.800",
      });
    } finally {
      setLoading(false);
    }
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
              style={[styles.back_arrow]}
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
            brand={brand}
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
              placeholder="MM/YY"
              keyboardType="number-pad"
              maxLength={5}
              formatValue={formatExpiryInput}
              containerStyle={styles.split_field}
              rules={{
                required: "Expiry date is required",
                pattern: {
                  value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                  message: "Use MM/YY format",
                },
                validate: (value) =>
                  parseCardExpiry(value) != null ||
                  "Enter a valid expiry date (MM/YY)",
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
            disabled={!formState.isValid || loading}
            loading={loading}
            onClick={on_submit}
            style={
              !formState.isValid || loading
                ? styles.button_disabled
                : undefined
            }
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
    overflow: "hidden",
    padding: 20,
    marginBottom: 8,
  },
  card_preview_visa: {
    backgroundColor: "#1a3c8b",
  },
  card_preview_mastercard: {
    backgroundColor: "#f2815a",
  },
  card_orb: {
    position: "absolute",
    width: SIZES.width * 0.55,
    height: SIZES.width * 0.55,
    borderRadius: SIZES.width * 0.275,
    bottom: -SIZES.width * 0.2,
    right: -SIZES.width * 0.08,
    opacity: 0.95,
  },
  card_orb_visa: {
    backgroundColor: "#2f6fd6",
  },
  card_orb_mastercard: {
    backgroundColor: "#f5b942",
  },
  card_brand_icon: {
    position: "absolute",
    top: 16,
    width: 56,
    height: 36,
    borderRadius: 6,
  },
  card_brand_icon_left: {
    left: 16,
  },
  card_brand_icon_right: {
    right: 16,
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
