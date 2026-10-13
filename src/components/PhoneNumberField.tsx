import _ from "lodash";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import apply_validations from "../../utils/rules";
import ImageLinks from "../../assets/ImageLink";
import { SIZES } from "../../constants";

interface Props {
  name: string;
  control: any;
  defaultValue?: string;
  label: string;
  validations?: any;
  style?: any;
  default_selected_country?: string;
  disabled?: boolean;
  on_country_code_select: (country_code: any) => any;
  placeholder?: any;
  type: any;
}

const PhoneNumberField = ({
  name,
  control,
  defaultValue,
  label,
  validations,
  style,
  default_selected_country = "+1",
  on_country_code_select,
  disabled,
  placeholder,
  type,
}: Props) => {
  const [show_country, set_show_country] = useState(false);
  const [selected_country_code, set_selected_country_code] = useState(
    default_selected_country ? default_selected_country : "+1"
  );

  const handle_select_country_code = (item: any) => {
    set_selected_country_code(item?.dial_code);
    on_country_code_select?.(item?.dial_code);
    set_show_country(false);
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue ?? ""}
      rules={apply_validations({
        ...validations,
        name,
        label,
      })}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        return (
          <View style={[styles.container, style]}>
            {!_.isEmpty(label) && (
              <Text style={styles.label_style}>{label}</Text>
            )}
            <View
              style={[
                styles.inputRow,
                disabled && styles.inputRowDisabled,
              ]}
            >
              <TouchableOpacity
                hitSlop={{ top: 5, right: 5, bottom: 5, left: 5 }}
                style={styles.country_code_divider}
                onPress={() => !disabled && set_show_country(true)}
                disabled={disabled}
              >
                <Text style={styles.countryCodeText}>
                  {selected_country_code}
                </Text>
                <Image
                  source={ImageLinks?.down_arrow}
                  style={styles.icon_style}
                />
              </TouchableOpacity>
              <TextInput
                value={value ?? ""}
                editable={!disabled}
                onBlur={onBlur}
                onChangeText={(text) => {
                  if (text === " ") {
                    return;
                  }

                  let final_text = text;

                  if (type === "number" && text.length > 0) {
                    if (!/^\d*$/.test(text)) {
                      return;
                    }
                    if (final_text.length > 1) {
                      final_text = text.replace(/^0+/, "");
                    }
                  }

                  onChange(final_text);
                }}
                keyboardType="phone-pad"
                placeholder={placeholder}
                placeholderTextColor="#666"
                style={styles.input_field}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="telephoneNumber"
              />
            </View>
            {error && <Text style={styles.formItemError}>{error.message}</Text>}
            <CountryPicker
              lang="en"
              initialState="+1"
              show={show_country}
              onBackdropPress={() => set_show_country(false)}
              itemTemplate={({ item, name: country_name, onPress }) => {
                return (
                  <Pressable
                    style={{
                      height: 41,
                      marginTop: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 50,
                    }}
                    onPress={onPress}
                  >
                    <Text>{item.flag}</Text>
                    <Text>{country_name}</Text>
                    <Text>{item.dial_code}</Text>
                  </Pressable>
                );
              }}
              pickerButtonOnPress={(item) => handle_select_country_code(item)}
              style={{
                modal: {
                  height: 500,
                },
                textInput: {
                  backgroundColor: "rgb(211, 211, 211)",
                  marginHorizontal: 40,
                  paddingHorizontal: 10,
                  borderColor: "transparent",
                  borderWidth: 1,
                },
              }}
            />
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZES.width * 0.88,
    maxWidth: "100%",
    alignSelf: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: SIZES.height * 0.055,
    borderRadius: 10,
    backgroundColor: "rgb(211, 211, 211)",
    paddingRight: 10,
  },
  inputRowDisabled: {
    opacity: 0.6,
  },
  input_field: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 8,
    borderWidth: 0,
  },
  country_code_divider: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  countryCodeText: {
    color: "grey",
  },
  icon_style: {
    resizeMode: "contain",
    height: SIZES.height * 0.02,
    width: SIZES.width * 0.03,
    marginLeft: 4,
  },
  label_style: {
    marginVertical: SIZES.height * 0.01,
    opacity: 0.5,
    fontWeight: "400",
    fontSize: 16,
  },
  formItemError: {
    color: "red",
    fontSize: 14,
    marginTop: SIZES.height * 0.003,
  },
});

export default PhoneNumberField;
