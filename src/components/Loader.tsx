import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import React from "react";
import { useAppTheme } from "../hooks/useAppTheme";

const Loader = () => {
  const { colors } = useAppTheme();

  return (
    <Modal visible={true} transparent>
      <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="rgb(237,117,80)" />
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});
