import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useGetLocation, type DeliveryAddress } from "../../../hooks/useGetLocation";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { ACCENT } from "../../../../utils/theme/appTheme";
import { Image } from "native-base";
import ImageLinks from "../../../../assets/ImageLink";
import utils from "../../../../utils/utils";
import constants from "../../../../utils/constants";

function isDeliveryAddress(value: unknown): value is DeliveryAddress {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as DeliveryAddress;
  return (
    typeof record.latitude === "number" &&
    typeof record.longitude === "number" &&
    typeof record.formattedAddress === "string"
  );
}

type Props = {
  onAddressSelected: (address: DeliveryAddress) => void;
};

export default function DeliveryAddressButton({
  onAddressSelected,
}: Props) {
  const { colors } = useAppTheme();
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const getLocation = useGetLocation();
  const onAddressSelectedRef = useRef(onAddressSelected);
  onAddressSelectedRef.current = onAddressSelected;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await utils.retrieve_data(
        constants.storage_keys.deliveryAddress,
      );
      if (cancelled || !isDeliveryAddress(stored)) {
        return;
      }
      setAddress(stored);
      onAddressSelectedRef.current(stored);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGetLocation() {
    if (loading) return;

    setLoading(true);

    try {
      const result = await getLocation();

      setAddress(result);
      onAddressSelected(result);
      await utils.store_data(
        constants.storage_keys.deliveryAddress,
        JSON.stringify(result),
      );
    } catch {
      // Error toast is shown in useGetLocation.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable
      onPress={handleGetLocation}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Get current delivery address"
      style={[styles.container, { backgroundColor: colors.surface  }]}
    >
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Delivering to
        </Text>

        <Text
          numberOfLines={2}
          style={[
            styles.address,
            {
              color: address ? colors.text : colors.placeholder,
            },
          ]}
        >
          {address?.formattedAddress ?? "Choose your location"}
        </Text>

        <Text style={[styles.action, { color: ACCENT }]}>
          {address ? "Update location" : "Use my current location"}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={ACCENT} />
      ) : (
        <Image
          source={ImageLinks?.down_arrow}
          alt=""
          style={[styles.icon_style, { tintColor: colors.icon }]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  icon_style:{
    width: 16,
    height: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  address: {
    fontSize: 15,
    fontWeight: "600",
  },
  action: {
    marginTop: 6,
    fontSize: 14,
  },
});