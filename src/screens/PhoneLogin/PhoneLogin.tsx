import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoHeader from "../../components/LogoHeader";
import { useForm } from "react-hook-form";
import PhoneNumberField from "../../components/PhoneNumberField";
import { View, StyleSheet, Platform } from "react-native";
import { SIZES } from "../../../constants";
import Button from "../../components/Button";
import { supabase } from "../../../supabase.config";
import { useAppToast } from "../../context/AppToast";
import { useNavigation } from "@react-navigation/native";
import utils from "../../../utils/utils";
import constants from "../../../utils/constants";

const PhoneLogin = () => {
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      phone_number: "",
      country_code: "+1",
    },
  });
  const [loading, set_loading] = useState(false);
  const toast = useAppToast();
  const navigate: any = useNavigation();

  const handle_country_code = (code: any) => {
    setValue("country_code", code);
  };

  const onSubmit = handleSubmit((data) => {
    handle_signin_with_otp(data);
  });

  const handle_signin_with_otp = async (data: any) => {
    set_loading(true);
    const phone_number = `${data?.country_code}${data?.phone_number}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone_number,
    });

    set_loading(false);
    if (error) {
      toast.show({
        title: error?.message,
        placement: "top",
        backgroundColor: "red.800",
      });
      return;
    }

    toast.show({
      title: "OTP sent successfully",
      placement: "top",
      backgroundColor: "green.800",
    });
    await utils.store_data(
      "user_data",
      JSON.stringify({ phone_number: phone_number }),
    );
    navigate.navigate(constants.route_names.OtpLogin);
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
      <LogoHeader
        allow_back={true}
        title={"Log In with Your Phone Number"}
        sub_title={"We'll send you a verification code"}
      />

      <View style={styles.container}>
        <View style={styles.text_field_container}>
          <PhoneNumberField
            name="phone_number"
            label="Phone Number"
            validations={{
              required: true,
              number: true,
            }}
            on_country_code_select={handle_country_code}
            control={control}
            type={"number"}
          />
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          text={"Verify"}
          onClick={onSubmit}
          loading={loading}
          type="primary"
          width={SIZES.width * 0.88}
        />
      </View>
    </SafeAreaView>
  );
};

export default PhoneLogin;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    flex: 1,
  },
  text_field_container: {
    marginHorizontal: SIZES.width * 0.06,
    marginVertical: SIZES.height * 0.02,
  },
  buttonWrapper: {
    alignItems: "center",
    marginVertical: Platform.OS === "android" ? 20 : 0,
  },
});
