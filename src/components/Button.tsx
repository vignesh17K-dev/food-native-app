import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import { SIZES } from "../../constants";
import { ACCENT } from "../../utils/theme/appTheme";

type ButtonType = "primary" | "secondary";

interface Props {
  text: string;
  type: ButtonType;
  width?: number | string;
  onClick?: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  activityIndicatorProps?: any;
  disabled?: boolean;
}

const Button = ({
  text,
  type,
  width,
  onClick,
  loading,
  style,
  activityIndicatorProps,
  disabled,
}: Props) => {
  const isDisabled = Boolean(disabled || loading);

  const renderButton = () => {
    switch (type) {
      case "primary":
        return (
          <TouchableOpacity disabled={isDisabled} onPress={onClick}>
            <View
              style={[
                styles.primaryButton,
                isDisabled && styles.primaryButtonDisabled,
                style,
                width !== undefined ? { width } : null,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color="#ffffff"
                  size="small"
                  {...activityIndicatorProps}
                />
              ) : (
                <Text
                  style={[
                    styles.primaryButtonText,
                    isDisabled && styles.primaryButtonTextDisabled,
                  ]}
                >
                  {text}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity disabled={isDisabled} onPress={onClick}>
            <View
              style={[
                styles.secondaryButton,
                isDisabled && styles.secondaryButtonDisabled,
                style,
                width !== undefined ? { width } : null,
              ]}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  isDisabled && styles.secondaryButtonTextDisabled,
                ]}
              >
                {text}
              </Text>
            </View>
          </TouchableOpacity>
        );
    }
  };

  return <View>{renderButton()}</View>;
};

const styles = StyleSheet.create({
  secondaryButton: {
    borderRadius: 10,
  },
  secondaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButton: {
    backgroundColor: ACCENT,
    padding: SIZES.height * 0.015,
    borderRadius: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: "#f3b9a5",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: Dimensions.get("window").width * 0.04,
    textAlign: "center",
  },
  primaryButtonTextDisabled: {
    color: "rgba(255,255,255,0.85)",
  },
  secondaryButtonText: {
    color: "rgb(159,164,169)",
    fontWeight: "700",
    fontSize: Dimensions.get("window").width * 0.04,
    textAlign: "center",
  },
  secondaryButtonTextDisabled: {
    color: "rgb(190,194,198)",
  },
});

export default Button;
