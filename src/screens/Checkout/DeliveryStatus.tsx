import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import Header from "../../components/Header";
import VerticalStepper from "../../components/VerticalStepper";
import ImageLinks from "../../../assets/ImageLink";
import constants from "../../../utils/constants";
import { SIZES } from "../../../constants";
import { Divider } from "native-base";
import Button from "../../components/Button";

/** Static for now — wire to order status API later */
const CURRENT_STEP = 0;

const DeliveryStatus = ({ navigation }: any) => {
  const { colors, darkMode } = useAppTheme();

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
              style={[
                styles.back_arrow,
                darkMode && { tintColor: colors.icon },
              ]}
              alt="back"
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.textSecondary,
          }}
        >
          Estimated Delivery
        </Text>

        <Text style={[styles.title, { color: colors.text }]}>
          12 Sept 2026 / 2:00PM
        </Text>

        <View
          style={[
            styles.stepper_wrap,
            {
              backgroundColor: colors.surface,
              borderColor: darkMode
                ? "rgba(255,255,255,0.12)"
                : colors.border,
              borderWidth: StyleSheet.hairlineWidth,
              shadowOpacity: darkMode ? 0 : 0.1,
              elevation: darkMode ? 0 : 5,
            },
          ]}
        >
          <View style={styles.track_header}>
            <Text style={[styles.track_title, { color: colors.text }]}>
              Track Order
            </Text>
            <Text style={[styles.track_id, { color: colors.textSecondary }]}>
              #56823
            </Text>
          </View>
          <Divider
            style={{
              marginVertical: 20,
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.12)"
                : colors.border,
            }}
          />
          <VerticalStepper
            steps={constants.delivery_steps}
            currentStep={CURRENT_STEP}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer_button_wrap,
          { backgroundColor: colors.background },
        ]}
      >
        <Button
          text="Cancel"
          type="secondary"
          style={{ width: SIZES.width * 0.3 }}
          onClick={handle_back_home}
        />
        <Button
          text="Map View"
          type="primary"
          icon={ImageLinks.map}
          iconStyle={{ width: 20, height: 20, tintColor: "#ffffff" }}
          style={{ width: SIZES.width * 0.5 }}
          onClick={() => navigation.navigate(constants.route_names.MapView)}
        />
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
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
    paddingBottom: 32,
    alignItems: "center",
  },
  icon_circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 15,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  stepper_wrap: {
    width: "100%",
    marginTop: 15,
    borderRadius: 10,
    padding: 30,
    shadowColor: "rgba(0,0,0,0.25)",
    shadowOffset: {
      width: 0,
      height: -15,
    },
    shadowRadius: 10,
  },
  track_header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  track_title: {
    fontSize: 16,
    fontWeight: "800",
  },
  track_id: {
    fontSize: 16,
    fontWeight: "700",
  },
  footer_button_wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    zIndex: 5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.height * 0.03,
    gap: 20,
  },
});
