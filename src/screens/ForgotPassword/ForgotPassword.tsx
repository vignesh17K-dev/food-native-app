/* eslint-disable no-unused-vars */
import { View } from "native-base";
import { useAppToast } from "../../context/AppToast";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../../constants";
import { Platform, StyleSheet } from "react-native";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import { useForm } from "react-hook-form";
import { supabase } from "../../../supabase.config";
import { makeRedirectUri } from "expo-auth-session";
import LogoHeader from "../../components/LogoHeader";
import utils from "../../../utils/utils";

function ForgotPassword() {
  const [loading, set_loading] = useState(false);
  const toast = useAppToast();
  const { control, handleSubmit } = useForm();
  const redirect_to = makeRedirectUri();


  const handle_send_reset_password = async (payload:any) => {
    set_loading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(payload, {
      redirectTo: `${redirect_to}resetPassword`,
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
    await utils.store_data("user_data", JSON.stringify({ email: payload }));
    toast.show({
      title: "Email sent",
      placement: "top",
      backgroundColor: "green.800",
    });
  };

  const onSubmit = handleSubmit((data) => {
    const { email } = data;
    handle_send_reset_password(email);
  });

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
      <LogoHeader
        allow_back={true}
        title="Password Recovery"
        sub_title="Please enter your email address to recover your password"
      />

      <View style={styles.container}>
        <View style={styles.textContainer}>
          <InputField
            name="email"
            label="Email"
            validations={{
              required: true,
              email: true,
            }}
            control={control}
          />
        </View>
      </View>

      <View
        style={{
          alignItems: "center",
          marginVertical: Platform.OS === "android" && 20,
        }}
      >
        <Button
          text={"Send Mail"}
          onClick={onSubmit}
          loading={loading}
          type="primary"
          width={SIZES.width * 0.88}
        />
      </View>
    </SafeAreaView>
  );
}

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    flex: 1,
  },
  img_container: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: SIZES.width * 0.02,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    fontWeight: "700",
    marginVertical: SIZES.height * 0.008,
  },
  text: {
    fontSize: 18,
    marginHorizontal: SIZES.width * 0.1,
    lineHeight: 30,
    textAlign: "center",
    color: COLORS.darkGray,
  },
  textContainer: {
    width: "90%",
  },
});
