import { useEffect } from "react";
import { Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "../../supabase.config";
import { useAppToast } from "../context/AppToast";

const RESET_PASSWORD_PREFIX = "eat-me-app://resetPassword";

const DeepLinkHandler = () => {
  const navigation: any = useNavigation();
  const toast = useAppToast();

  const handle_error = () => {
    toast.show({
      title: "Invalid access token",
      placement: "top",
      backgroundColor: "red.800",
    });
  };

  const refresh_session_and_navigate = async (refresh_token: string) => {
    const { error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) {
      handle_error();
      return;
    }
    navigation.navigate("resetPassword");
  };

  const handle_deep_link = async (url: string) => {
    if (!url.startsWith(RESET_PASSWORD_PREFIX)) {
      return;
    }

    try {
      const { params } = QueryParams.getQueryParams(url);
      const refresh_token = params.refresh_token;
      if (typeof refresh_token === "string" && refresh_token.length > 0) {
        await refresh_session_and_navigate(refresh_token);
      } else {
        handle_error();
      }
    } catch {
      handle_error();
    }
  };

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          handle_deep_link(url);
        }
      })
      .catch(() => {
        // Ignore cold-start URL errors (e.g. none on simulator).
      });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url) {
        handle_deep_link(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
};

export default DeepLinkHandler;
