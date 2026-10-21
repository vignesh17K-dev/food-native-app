import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import React from "react";
import ImageLinks from "../../assets/ImageLink";
import { COLORS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../hooks/useAppTheme";

interface Props {
  allow_back?: boolean;
  title?: string;
  sub_title?: string;
  style?: any;
}

const LogoHeader = ({
  allow_back = false,
  title,
  sub_title,
  style = {},
}: Props) => {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  return (
    <View style={{...style}}>
      <View style={styles.img_container}>
        {allow_back ? (
          <>
            <View style={{ width: "25%" }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  source={ImageLinks?.back_arrow}
                  style={{
                    resizeMode: "contain",
                    height: SIZES.height * 0.04,
                  }}
                  alt="logo"
                />
              </TouchableOpacity>
            </View>
            <View style={{ width: "75%" }}>
              <Image
                source={ImageLinks?.logo}
                style={{
                  resizeMode: "contain",
                  width: SIZES.width * 0.5,
                  marginTop: 20,
                  height: 100,
                }}
                alt="logo"
              />
            </View>
          </>
        ) : (
          <View
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            <Image
              source={ImageLinks?.logo}
              style={{
                resizeMode: "contain",
                width: SIZES.width * 0.5,
                marginTop: 20,
                height: 100,
              }}
              alt="logo"
            />
          </View>
        )}
      </View>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}
      {sub_title && (
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {sub_title}
        </Text>
      )}
    </View>
  );
};

export default LogoHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    flex: 1,
  },
  img_container: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: SIZES.width * 0.02,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    fontWeight: "700",
    marginVertical: SIZES.height * 0.008,
  },
  text: {
    fontSize: 18,
    marginHorizontal: SIZES.width * 0.1,
    lineHeight: 30,
    textAlign: "center",
    color: COLORS.darkGray,
  },
  textContainer: {
    width: "90%",
  },
});
