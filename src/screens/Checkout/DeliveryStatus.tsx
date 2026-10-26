import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import Header from "../../components/Header";
import ImageLinks from "../../../assets/ImageLink";
import constants from "../../../utils/constants";
import { SIZES } from "../../../constants";
import { ACCENT } from "../../../utils/theme/appTheme";

const DeliveryStatus = ({ navigation }: any) => {
  const { colors } = useAppTheme();

  const handle_back_home = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: constants.route_names.MainApp }],
    });
  };

  return (
    <ThemedScreen style={styles.screen}>
      <Header
        container_style={styles.header_container}
        title={
          <Text style={[styles.header_title, { color: colors.text }]}>
            Delivery Status
          </Text>
        }
        left_section={
          <TouchableOpacity onPress={handle_back_home}>
            <Image
              source={ImageLinks.back_arrow}
              style={styles.back_arrow}
              alt="back"
            />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <View style={[styles.icon_circle, { backgroundColor: colors.accentSoft }]}>
          <MaterialCommunityIcons name="moped" size={48} color={ACCENT} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Your order is on the way
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We&apos;ll keep you updated as your delivery progresses.
        </Text>
      </View>
    </ThemedScreen>
  );
};

export default DeliveryStatus;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header_container: {
    marginRight: 18,
    marginHorizontal: SIZES.width * 0.02,
    marginTop: 12,
    marginBottom: 12,
  },
  header_title: {
    fontSize: 18,
    fontWeight: "600",
  },
  back_arrow: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.padding,
  },
  icon_circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
