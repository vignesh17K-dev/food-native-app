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
import { set_cart, clear_cart } from "../store/slices/CartSlice";
import Loader from "./components/Loader";
import cart from "../utils/api/cart";

const MainApp = () => {
  const dispatch = useDispatch();
  const toast = useAppToast();
  const [loading, set_loading] = useState(false);

  const initialize_user_cart = async (user_id?: string | null) => {
    if (!user_id) {
      return;
    }

    try {
      const response = await cart.initialize_cart({ user_id });
      const cart_data = response?.data ?? response;  
      if (cart_data) {
        dispatch(set_cart(cart_data));
      }
    } catch (error) {
      console.error("Initialize Cart Error:", error);
    }
  };


  const handle_session_change = (
    event: AuthChangeEvent,
    session: Session | null,
  ) => {
    dispatch(setSession({ session }));
    dispatch(setLogin(!!session));

    if (event === "SIGNED_OUT") {
      dispatch(clear_cart());
      return;
    }

    if (event === "SIGNED_IN" && session?.user?.id) {
      initialize_user_cart(session.user.id);
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
        await initialize_user_cart(data.session.user.id);
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
