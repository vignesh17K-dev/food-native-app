import { View, StyleSheet, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { SIZES } from "../../../../constants";
import InputField from "../../../components/InputField";
import Password from "../../../components/Password";
import Button from "../../../components/Button";
import { Messages } from "../../../../utils/text";
import { useDispatch, useSelector } from "react-redux";
import { changeLoginType, setLogin } from "../../../../store/slices/LoginSlice";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../../../supabase.config";
import { useForm } from "react-hook-form";
import { useAppToast } from "../../../context/AppToast";
import PhoneNumberField from "../../../components/PhoneNumberField";
import _ from "lodash";
import constants from "../../../../utils/constants";
import { useAppTheme } from "../../../hooks/useAppTheme";

const loginInputFieldContainer = ({ navigation }: any) => {
  const { colors, darkMode } = useAppTheme();
  const [loading, set_loading] = useState(false);
  const navigate: any = useNavigation();
  const loginType = useSelector((state: any) => state.login.loginType);
  const dispatch = useDispatch();
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      phone_number: "",
      country_code: "+1",
    },
  });
  const toast = useAppToast();

  const onSubmit = handleSubmit((data) => {
    const { email, password } = data;

    switch (loginType) {
      case "signup":
        set_loading(true);
        handle_create_new_user(data);
        break;
      case "login":
        set_loading(true);
        handle_existing_user(email, password);
        break;
    }
  });

  const handle_navigation = () => {
    dispatch(setLogin(true));
    set_loading(false);
    navigation.reset({
      index: 0,
      routes: [{ name: constants.route_names?.MainApp }],
    });
  };


  const handle_create_new_user = async (payload: any) => {
    const phone_number = `${payload?.country_code}${payload?.phone_number}`;
    const { error } = await supabase.auth.signUp({
      email: payload?.email,
      password: payload?.password,
      phone: phone_number,
      options:{
        data:{
          username: payload?.username,
          phone: payload?.phone_number,
          country_code: payload?.country_code,
        }
      }
    });

    if (error) {
      set_loading(false);
      toast.show({
        title: error?.message,
        placement: "top",
        background: "red.800",
      });
      return;
    }
    handle_navigation();
  };

  const handle_existing_user = async (email: any, password: any) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      set_loading(false);
      toast.show({
        title: error?.message,
        placement: "top",
        background: "red.800",
      });
      return;
    }

    handle_navigation();
  };

  const country_code = watch("country_code");

  const handle_country_code = (code: any) => {
    setValue("country_code", code);
  };

  useEffect(() => {
    if (_.isEmpty(country_code)) {
      setValue("country_code", "+1");
    }
  }, [country_code]);

  return (
    <View style={styles.text_field_container}>
      {loginType === "signup" && (
        <InputField
          name="username"
          label="Username"
          style={styles.field_spacing}
          validations={{
            required: true,
            minLength: 3,
          }}
          control={control}
        />
      )}

      <InputField
        name="email"
        label="Email"
        validations={{
          required: true,
          email: true,
        }}
        style={styles.field_spacing}
        control={control}
      />

      {loginType === "signup" && (
        <PhoneNumberField
          name="phone_number"
          label="Phone Number"
          style={styles.field_spacing}
          validations={{
            required: true,
            number: true,
          }}
          on_country_code_select={handle_country_code}
          control={control}
          type={"number"}
        />
      )}

      <Password
        name="password"
        style={styles.field_spacing}
        label="Password"
        validations={{
          required: true,
          minLength: 6,
        }}
        control={control}
      />

      <View
        style={{
          alignItems: "flex-end",
        }}
      >
        <Text
          style={[
            styles.forgot_password_style,
            darkMode
              ? { color: "#ffffff", opacity: 1 }
              : { color: colors.text, opacity: 1 },
          ]}
          onPress={() => navigate.navigate(constants.route_names.ForgotPassword)}
        >
          Forgot Password?
        </Text>
      </View>

      <View style={styles.button_container}>
        <Button
          loading={loading}
          onClick={onSubmit}
          text={loginType === "signup" ? "Sign Up" : "Sign In"}
          type="primary"
          width={SIZES.width * 0.88}
        />
      </View>

      <Text style={[styles.sub_text_style, { color: colors.textSecondary }]}>
        {loginType === "signup" ? (
          <React.Fragment>
            {Messages.signUpText}{" "}
            <Text
              onPress={() => dispatch(changeLoginType("login"))}
              style={styles.cta_text}
            >
              Sign In
            </Text>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {Messages.loginText}{" "}
            <Text
              onPress={() => dispatch(changeLoginType("signup"))}
              style={styles.cta_text}
            >
              Sign Up
            </Text>
          </React.Fragment>
        )}
      </Text>
    </View>
  );
};

export default loginInputFieldContainer;

const styles = StyleSheet.create({
  text_field_container: {
    marginHorizontal: SIZES.width * 0.06,
    marginVertical: SIZES.height * 0.03,
    width: SIZES.width * 0.88,
    maxWidth: "100%",
    alignSelf: "center",
  },
  field_spacing: {
    marginBottom: SIZES.height * 0.001,
    width: "100%",
    alignSelf: "stretch",
  },

  cta_text: {
    color: "rgb(237,117,80)",
    fontWeight: "800",
  },

  sub_text_style: {
    textAlign: "center",
    fontSize: SIZES.width * 0.04,
    color: "grey",
    marginVertical: SIZES.height * 0.01,
  },

  button_container: {
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: SIZES.height * 0.01,
  },

  forgot_password_style: {
    opacity: 0.3,
    marginTop: 5,
    fontSize: SIZES.width * 0.034,
  },
});
