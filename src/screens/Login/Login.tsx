import React, { useState } from "react";
import LoginInputFieldContainer from "../Login/components/loginInputFieldContainer";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image, Text, View } from "native-base";
import { useAppToast } from "../../context/AppToast";
import { SIZES } from "../../../constants";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import ImageLinks from "../../../assets/ImageLink";
import { supabase } from "../../../supabase.config";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import LogoHeader from "../../components/LogoHeader";
import { Messages } from "../../../utils/text";
import constants from "../../../utils/constants";
import { setLogin, setLoggedInViaGoogle } from "../../../store/slices/LoginSlice";

WebBrowser.maybeCompleteAuthSession();

const google_redirect_to = makeRedirectUri({
  scheme: "eat-me-app",
  path: "auth/callback",
});

async function create_session_from_url(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) {
      throw error;
    }
    return;
  }

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) {
      throw error;
    }
    return;
  }

  throw new Error("Google sign in did not return a session");
}

const Login = ({ navigation }: any) => {
  const { colors } = useAppTheme();
  const toast = useAppToast();
  const dispatch = useDispatch();
  const login_type = useSelector((state: any) => state?.login?.loginType);
  const navigate: any = useNavigation();
  const [google_loading, set_google_loading] = useState(false);

  const handle_signin_with_google = async () => {
    if (google_loading) {
      return;
    }

    set_google_loading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: google_redirect_to,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error || !data.url) {
        throw error ?? new Error("Could not start Google sign in");
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        google_redirect_to,
      );

      if (result.type !== "success" || !("url" in result) || !result.url) {
        return;
      }

      await create_session_from_url(result.url);
      dispatch(setLoggedInViaGoogle(true));
      dispatch(setLogin(true));
      navigation.reset({
        index: 0,
        routes: [{ name: constants.route_names.MainApp }],
      });
    } catch (error) {
      toast.show({
        title:
          error instanceof Error
            ? error.message
            : "Google sign in failed",
        placement: "top",
        backgroundColor: "red.800",
      });
    } finally {
      set_google_loading(false);
    }
  };

  return (
    <ThemedScreen
      style={[
        styles.screen,
        Platform.OS === "android" && styles.android_screen,
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <LogoHeader
            allow_back={false}
            title={
              login_type === "signup"
                ? Messages.signUpTitle
                : Messages.loginTitle
            }
            sub_title={
              login_type === "signup"
                ? Messages.signUpSubTitle
                : Messages.loginSubTitle
            }
          />
          <LoginInputFieldContainer navigation={navigation} />
        </ScrollView>
      </KeyboardAvoidingView>

      {login_type === "login" && (
        <TouchableOpacity onPress={() => navigate.navigate(constants.route_names.PhoneLogin)}>
          <View style={styles.phoneLogin}>
            <Text color="white">Login With Phone Number</Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        disabled={google_loading}
        onPress={handle_signin_with_google}
      >
        <View
          style={[
            styles.googleButton,
            { backgroundColor: colors.surface },
          ]}
        >
          <Image
            source={ImageLinks?.google_icon}
            alt="google_icon"
            style={{
              width: 20,
              height: 20,
            }}
          />
          <Text style={{ color: colors.text }}>Continue With Google</Text>
        </View>
      </TouchableOpacity>
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  android_screen: {
    marginVertical: 20,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 0.5,
    justifyContent: "center",
  },
  phoneLogin: {
    borderRadius: 10,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.8)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginHorizontal: SIZES.width * 0.05,
    marginBottom: 10,
  },
  googleButton: {
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginHorizontal: SIZES.width * 0.05,
  },
});

export default Login;
