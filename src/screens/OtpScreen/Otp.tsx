import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoHeader from "../../components/LogoHeader";
import { StyleSheet } from "react-native";
import utils from "../../../utils/utils";
import { OtpInput } from "react-native-otp-entry";
import { SIZES } from "../../../constants";
import { useAppToast } from "../../context/AppToast";
import { supabase } from "../../../supabase.config";
import Button from "../../components/Button";
import { setLogin } from "../../../store/slices/LoginSlice";
import { useDispatch } from "react-redux";
import constants from "../../../utils/constants";

function Otp({ navigation }) {
  const [user_data, set_user_data] = useState<any>({});
  const [time, set_time] = useState(60);
  const [loading, set_loading] = useState(false);
  const [opt, set_otp] = useState<any>();

  const toast = useAppToast();
  const dispatch = useDispatch();

  const handle_get_data = async () => {
    let data = await utils.retrieve_data("user_data");
    data && set_user_data(data);
  };

  const handle_resend_code = async () => {
    if (!time) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: user_data?.phone_number,
      });

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
      set_time(60);
    }
  };

  const handle_navigation = () => {
    dispatch(setLogin(true));
    set_loading(false);
    navigation.reset({
      index: 0,
      routes: [{ name: constants.route_names?.MainApp  }],
    });
  };

  const handle_verify_otp = async () => {
    set_loading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      phone: user_data?.phone_number,
      token: opt,
      type: "sms",
    });

    if (error) {
      toast.show({
        title: error?.message,
        placement: "top",
        backgroundColor: "red.800",
      });
      set_loading(false);
      return;
    }
    handle_navigation();
  };

  const handle_render_text = () => {
    const time_text = time > 0 ? `(${time}s)` : "";
    return `Resend ${time_text}`;
  };

  const handle_otp = (numeric_text: string) => {
    if (numeric_text.length === 4) {
      set_otp(numeric_text);
    }
  };

  useEffect(() => {
    handle_get_data();
  }, []);

  useEffect(() => {
    if (time > 0) {
      const timer_id = setInterval(() => {
        set_time((prev_time) => prev_time - 1);
      }, 1000);

      return () => clearInterval(timer_id);
    }
  }, [time]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
      <LogoHeader
        allow_back={true}
        title="OTP Authentication"
        sub_title={`An authentication code has been sent to your phone number ${user_data?.phone_number}`}
        style={{
          marginBottom: 15,
        }}
      />

      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
          <View style={styles.container}>
            <OtpInput
              numberOfDigits={4}
              focusColor={"#ff63d4d"}
              onTextChange={(text) => handle_otp(text)}
              focusStickBlinkingDuration={400}
              theme={{
                containerStyle:styles.opt_container,
                pinCodeContainerStyle:styles.pin_code_container
              }}
            />
            <TouchableOpacity onPress={handle_resend_code}>
              <View style={styles.resent_opt}>
                <Text style={{ fontSize: 18, opacity: 0.6 }}>
                  Didn't receive code?
                </Text>
                <Text
                  style={{ color: "#ff6d4d", fontSize: 18, fontWeight: "700" }}
                >
                  {handle_render_text()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        <View
          style={{
            alignItems: "center",
            marginVertical: Platform.OS === "android" ? 20 : 8,
          }}
        >
          <Button
            text="Verify"
            onClick={handle_verify_otp}
            loading={loading}
            type="primary"
            width={SIZES.width * 0.88}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    flex: 1,
  },
  content_container: {
    flexGrow: 0.5,
    justifyContent: "center",
  },
  opt_container: {
    width: "100%",
    paddingHorizontal: SIZES.width * 0.1,
    marginVertical: 25,
  },
  pin_code_container: {
    width: 58,
    height: 58,
    borderRadius: 12,
  },
  resent_opt: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
});

export default Otp;
