import React, { useEffect, useMemo } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import { NativeBaseProvider } from "native-base";
import MainApp from "./src/main";
import { NavigationContainer } from "@react-navigation/native";
import * as Updates from "expo-updates";
import DeepLinkHandler from "./src/components/DeepLinking";
import { PersistGate } from "redux-persist/integration/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppToastProvider, useAppToast } from "./src/context/AppToast";
import { StatusBar } from "react-native";
import { useAppSelector } from "./store/hooks";
import {
  navigationDarkTheme,
  navigationLightTheme,
} from "./utils/theme/appTheme";

function AppContent() {
  const toast = useAppToast();
  const darkMode = useAppSelector((state) => state.preferences.darkMode);
  const navigationTheme = useMemo(
    () => (darkMode ? navigationDarkTheme : navigationLightTheme),
    [darkMode],
  );

  useEffect(() => {
    if (__DEV__) {
      return;
    }

    async function on_fetch_update_async() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        toast.show({
          title: `Error fetching latest Expo update: ${error}`,
          placement: "top",
        });
      }
    }

    on_fetch_update_async();
  }, [toast]);

  return (
    <>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <NavigationContainer theme={navigationTheme}>
        <PersistGate persistor={persistor}>
          <MainApp />
        </PersistGate>
        <DeepLinkHandler />
      </NavigationContainer>
    </>
  );
}

function ThemedProviders({ children }: { children: React.ReactNode }) {
  const darkMode = useAppSelector((state) => state.preferences.darkMode);

  return (
    <NativeBaseProvider colorMode={darkMode ? "dark" : "light"}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </NativeBaseProvider>
  );
}

export default function App() {
  if (__DEV__) {
    require("./ReactotronConfig");
  }

  return (
    <Provider store={store}>
      <ThemedProviders>
        <AppToastProvider>
          <AppContent />
        </AppToastProvider>
      </ThemedProviders>
    </Provider>
  );
}
