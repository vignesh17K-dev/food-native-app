import React, { useEffect } from "react";
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

function AppContent() {
  const toast = useAppToast();

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
    <NavigationContainer>
      <PersistGate persistor={persistor}>
        <MainApp />
      </PersistGate>
      <DeepLinkHandler />
    </NavigationContainer>
  );
}

export default function App() {
  if (__DEV__) {
    require("./ReactotronConfig");
  }

  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <SafeAreaProvider>
          <AppToastProvider>
            <AppContent />
          </AppToastProvider>
        </SafeAreaProvider>
      </NativeBaseProvider>
    </Provider>
  );
}
