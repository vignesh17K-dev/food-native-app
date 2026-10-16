import React from "react";
import { Text, View } from "react-native";
import { useAppTheme } from "../../../hooks/useAppTheme";

function RecommendedRails() {
  const { colors } = useAppTheme();
  return (
    <View>
      <Text style={{ color: colors.text }}>RecommendedRails</Text>
    </View>
  );
}

export default RecommendedRails;
