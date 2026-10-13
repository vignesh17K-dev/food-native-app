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
import { HStack, Spinner } from "native-base";

type ButtonType = "primary" | "secondary";

interface Props {
  text: string;
  type: ButtonType;
  width?: number | string;
  onClick?: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  activityIndicatorProps?: any
}

const Button = ({ text, type, width, onClick, loading, style, activityIndicatorProps }: Props) => {
  const renderButton = () => {
    switch (type) {
      case "primary":
        return (
          <TouchableOpacity onPress={onClick}>
            <View
              style={[
                styles.primaryButton,
                style,
                width !== undefined ? { width } : null,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="black" size="small" {...activityIndicatorProps} />
              ) : (
                <Text style={styles.primaryButtonText}>{text}</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity onPress={onClick}>
            <View
              style={[
                styles.secondaryButton,
                style,
                width !== undefined ? { width } : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>{text}</Text>
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
  primaryButton: {
    backgroundColor: "#ed7550",
    padding: SIZES.height * 0.015,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: Dimensions.get("window").width * 0.04,
    textAlign: "center",
  },
  secondaryButtonText: {
    color: "rgb(159,164,169)",
    fontWeight: "700",
    fontSize: Dimensions.get("window").width * 0.04,
    textAlign: "center",
  },
});

export default Button;
