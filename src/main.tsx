import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-url-polyfill/auto";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Routes from "./routes";
import { supabase } from "../supabase.config";
import { setLogin } from "../store/slices/LoginSlice";
import { useDispatch } from "react-redux";
import { useAppToast } from "./context/AppToast";
import { setSession } from "../store/slices/User";
import { clear_cart } from "../store/slices/CartSlice";
import Loader from "./components/Loader";
import { initializeUserCart } from "../utils/cart/initializeUserCart";
import { connectPusher, disconnectPusher } from "../pusher.config";

const MainApp = () => {
  const dispatch = useDispatch();
  const toast = useAppToast();
  const [loading, set_loading] = useState(false);

  const handle_session_change = (
    event: AuthChangeEvent,
    session: Session | null,
  ) => {
    dispatch(setSession({ session }));
    dispatch(setLogin(!!session));

    if (event === "SIGNED_OUT") {
      dispatch(clear_cart());
      disconnectPusher().catch((error) => {
        console.log("Pusher disconnect on logout failed:", error);
      });
      return;
    }

    if (event === "SIGNED_IN" && session?.user?.id) {
      initializeUserCart(dispatch, session.user.id);
      connectPusher(session.user.id).catch((error) => {
        console.log("Pusher connect on login failed:", error);
      });
    }
  };

  const fetch_session = async () => {
    set_loading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        toast.show({
          title: error.message,
          placement: "top",
          background: "red.800",
        });
      }
      dispatch(setSession({ session: data.session }));
      dispatch(setLogin(!!data.session));

      if (data.session?.user?.id) {
        await initializeUserCart(dispatch, data.session.user.id);
        await connectPusher(data.session.user.id);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch session";
      console.error("Fetch Session Error:", message);
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    fetch_session();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handle_session_change);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaProvider>
      <Routes />
    </SafeAreaProvider>
  );
};

export default MainApp;
