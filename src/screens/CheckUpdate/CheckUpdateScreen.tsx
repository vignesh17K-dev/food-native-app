import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";

const ACCENT = "#ed7550";

const CheckUpdateScreen = ({ navigation }: any) => {
  const version =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "1.0.0";

  return (
    <SafeAreaView style={styles.safe_area}>
      <Header
        container_style={styles.header_container}
        title={<Text style={styles.header_title}>App Version</Text>}
        left_section={
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={ImageLinks?.back_arrow}
              style={styles.back_arrow}
              alt="back"
            />
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        <View style={styles.icon_circle}>
          <MaterialCommunityIcons
            name="cellphone-check"
            size={56}
            color={ACCENT}
          />
        </View>

        <Text style={styles.label}>App Version</Text>
        <Text style={styles.version}>{version}</Text>
      </View>
    </SafeAreaView>
  );
};

export default CheckUpdateScreen;

const styles = StyleSheet.create({
  safe_area: {
    backgroundColor: "#fff",
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
    color: "#1a1a1a",
  },
  back_arrow: {
    resizeMode: "contain",
    height: SIZES.height * 0.04,
  },
  header_divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e8e8e8",
    marginHorizontal: SIZES.width * 0.02,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: SIZES.height * 0.12,
  },
  icon_circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(237, 117, 80, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: "400",
    color: "#9a9a9a",
    marginBottom: 8,
  },
  version: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
});
