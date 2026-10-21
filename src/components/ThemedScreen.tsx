import React, { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = SafeAreaViewProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ThemedScreen = ({ children, style, ...rest }: Props) => {
  const { layout } = useAppTheme();

  return (
    <SafeAreaView style={[layout.screen, style]} {...rest}>
      {children}
    </SafeAreaView>
  );
};

export default ThemedScreen;
