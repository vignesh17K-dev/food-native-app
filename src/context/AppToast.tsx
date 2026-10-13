import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastOptions = {
  title: string;
  placement?: string;
  background?: string;
  backgroundColor?: string;
};

type ToastContextValue = {
  show: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastVariant(options: ToastOptions): "error" | "success" | "default" {
  const color = `${options.backgroundColor ?? options.background ?? ""}`;
  if (color.includes("red")) {
    return "error";
  }
  if (color.includes("green")) {
    return "success";
  }
  return "default";
}

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<"error" | "success" | "default">(
    "default"
  );
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMessage(null);
      }
    });
  }, [opacity]);

  const show = useCallback(
    (options: ToastOptions) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      setVariant(toastVariant(options));
      setMessage(options.title);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      hideTimer.current = setTimeout(hide, 3000);
    },
    [hide, opacity]
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message != null && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrapper,
            {
              top: insets.top + (Platform.OS === "ios" ? 8 : 12),
              opacity,
            },
          ]}
        >
          <View
            style={[
              styles.banner,
              variant === "error" && styles.error,
              variant === "success" && styles.success,
            ]}
          >
            <Text style={styles.text}>{message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useAppToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useAppToast must be used within AppToastProvider");
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  banner: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(40, 40, 40, 0.95)",
  },
  error: {
    backgroundColor: "rgba(153, 27, 27, 0.95)",
  },
  success: {
    backgroundColor: "rgba(22, 101, 52, 0.95)",
  },
  text: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
  },
});
