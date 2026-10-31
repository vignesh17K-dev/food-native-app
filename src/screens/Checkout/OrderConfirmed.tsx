import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import Button from "../../components/Button";
import ImageLinks from "../../../assets/ImageLink";
import constants from "../../../utils/constants";
import { SIZES } from "../../../constants";

const REDIRECT_SECONDS = 5;

const OrderConfirmed = ({ navigation, route }: any) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { order_id } = route.params
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const go_to_delivery_status = () => {
    navigation.replace(constants.route_names.DeliveryStatus, { order_id });
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigation.replace(constants.route_names.DeliveryStatus, { order_id });
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, navigation]);

  return (
    <ThemedScreen style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <Image
          source={ImageLinks.party_popper}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>
          Order placed successfully
        </Text>
        <Text style={[styles.redirect_text, { color: colors.textSecondary }]}>
          Redirecting to delivery status in {secondsLeft}s
        </Text>
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopColor: colors.border,
          },
        ]}
      >
        <Button
          text="Done"
          type="primary"
          width="100%"
          onClick={go_to_delivery_status}
        />
      </View>
    </ThemedScreen>
  );
};

export default OrderConfirmed;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.padding,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  redirect_text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
  },
});
