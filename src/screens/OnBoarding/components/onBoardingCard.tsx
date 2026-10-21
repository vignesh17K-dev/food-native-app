import React from "react";
import { View, Image, Text } from "react-native";
import { ImageBackground } from "react-native";
import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../../../constants";
import { Platform } from "react-native";
import { useAppTheme } from "../../../hooks/useAppTheme";

function OnBoardingCard({ background, image, title, text, index }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.scrollContainer}>
      <View style={{ flex: 3 }}>
        <ImageBackground
          source={background}
          style={{
            ...styles.background,
            height:
              index === 1
                ? Platform.OS === "android"
                  ? "96.5%"
                  : "95%"
                : "100%",
          }}
        >
          <Image source={image} style={styles.image} resizeMode="contain" />
        </ImageBackground>
      </View>

      <View style={styles.textBox}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    width: SIZES.width,
  },
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    zIndex: -1,
  },
  image: {
    width: SIZES.width * 0.75,
    height: SIZES.width * 0.75,
    marginBottom: -SIZES.padding,
  },
  textBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.radius,
  },
  title: {
    fontSize: 25,
    textAlign: "center",
    fontWeight: "700",
    marginVertical: 15,
  },
  text: {
    fontSize: 15,
    marginHorizontal: 20,
    lineHeight: 30,
    textAlign: "center",
    color: COLORS.darkGray,
  },
});

export default OnBoardingCard;
