import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import ThemedScreen from "../../components/ThemedScreen";
import Header from "../../components/Header";
import { useAppTheme } from "../../hooks/useAppTheme";
import { type DeliveryAddress } from "../../hooks/useGetLocation";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants";
import constants from "../../../utils/constants";
import utils from "../../../utils/utils";
import { ACCENT } from "../../../utils/theme/appTheme";

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

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const MapScreen = ({ navigation }: any) => {
  const { colors } = useAppTheme();
  const [region, setRegion] = useState<MapRegion>(constants.default_map_region);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await utils.retrieve_data(
          constants.storage_keys.deliveryAddress,
        );

        const permission = await Location.requestForegroundPermissionsAsync();
        const granted = permission.status === "granted";

        if (cancelled) {
          return;
        }

        setShowUserLocation(granted);

        if (granted) {
          try {
            const position = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            if (!cancelled) {
              setRegion({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              return;
            }
          } catch {
            // Fall through to stored delivery address.
          }
        }

        if (!cancelled && isDeliveryAddress(stored)) {
          setRegion({
            latitude: stored.latitude,
            longitude: stored.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemedScreen style={styles.screen}>
      <Header
        container_style={styles.header_container}
        title={
          <Text style={[styles.header_title, { color: colors.text }]}>
            Map View
          </Text>
        }
        left_section={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={ImageLinks.back_arrow}
              style={styles.back_arrow}
              alt="back"
            />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={showUserLocation}
          showsMyLocationButton={showUserLocation}
          followsUserLocation={showUserLocation}
        />
      )}
    </ThemedScreen>
  );
};

export default MapScreen;

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
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
