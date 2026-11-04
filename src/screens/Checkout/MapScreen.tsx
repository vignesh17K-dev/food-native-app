import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import config from "../../../utils/config";
import ThemedScreen from "../../components/ThemedScreen";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { useAppTheme } from "../../hooks/useAppTheme";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants";
import constants from "../../../utils/constants";
import { ACCENT } from "../../../utils/theme/appTheme";
import { useAppSelector } from "../../../store/hooks";
import orderApi from "../../../utils/api/order";
import {
  type Coordinate,
  type OrderDeliveryStatus,
} from "../../../store/slices/OrderStatusSlice";
import { remainingRouteFrom } from "../../../utils/map/routeProgress";

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

function isCoordinate(value: unknown): value is Coordinate {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Coordinate;
  return (
    typeof record.latitude === "number" &&
    typeof record.longitude === "number"
  );
}

function toCoordinate(value: unknown): Coordinate | null {
  return isCoordinate(value) ? value : null;
}

function hasGoogleMapsApiKey() {
  if (Platform.OS !== "android") {
    return true;
  }

  return config.google.mapsApiKey.trim().length > 0;
}

const MapScreen = ({ navigation, route }: any) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const map_ref = useRef<MapView | null>(null);
  const has_fitted_route = useRef(false);

  const [showUserLocation, setShowUserLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullRoute, setFullRoute] = useState<Coordinate[]>([]);
  const [customerLocation, setCustomerLocation] = useState<Coordinate | null>(
    null,
  );
  const [restaurantLocation, setRestaurantLocation] =
    useState<Coordinate | null>(null);
  const [initialDeliveryLocation, setInitialDeliveryLocation] =
    useState<Coordinate | null>(null);
  const [trackCourierIcon, setTrackCourierIcon] = useState(true);
  const [orderStatusFromApi, setOrderStatusFromApi] =
    useState<OrderDeliveryStatus | null>(null);

  const { order_id } = route.params ?? {};
  const order_event_from_store = useAppSelector((state) =>
    order_id ? state.orderStatus.statusesByOrderId[order_id] : undefined,
  );
  const order_status =
    order_event_from_store?.order_status ?? orderStatusFromApi;
  const is_delivered = order_status === "delivered";

  const courierLocation = useMemo(() => {
    const live = toCoordinate(order_event_from_store?.delivery_location);
    if (live) {
      return live;
    }
    if (initialDeliveryLocation) {
      return initialDeliveryLocation;
    }
    return restaurantLocation;
  }, [
    order_event_from_store?.delivery_location,
    initialDeliveryLocation,
    restaurantLocation,
  ]);

  const remainingRoute = useMemo(() => {
    if (!courierLocation || fullRoute.length === 0) {
      return [];
    }
    return remainingRouteFrom(fullRoute, courierLocation);
  }, [fullRoute, courierLocation]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!cancelled) {
          setShowUserLocation(permission.status === "granted");
        }
      } catch {
        if (!cancelled) {
          setShowUserLocation(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!order_id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const response = await orderApi.get_order(order_id);
        const order = response?.data;
        if (cancelled || !order) {
          return;
        }

        const customer = toCoordinate(
          order?.delivery_detail?.customer_location,
        );
        const restaurant = toCoordinate(
          order?.delivery_detail?.restaurant_location,
        );
        const delivery = toCoordinate(
          order?.delivery_detail?.delivery_location,
        );

        setCustomerLocation(customer);
        setRestaurantLocation(restaurant);
        setInitialDeliveryLocation(delivery ?? restaurant);
        if (typeof order?.order_status === "string") {
          setOrderStatusFromApi(order.order_status);
        }
      } catch (error) {
        console.log("Failed to load order for map:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [order_id]);

  useEffect(() => {
    if (!restaurantLocation || !customerLocation) {
      return;
    }

    let cancelled = false;

    const getRoute = async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${restaurantLocation.longitude},${restaurantLocation.latitude};` +
          `${customerLocation.longitude},${customerLocation.latitude}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Routing request failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("No route found");
        }

        const coordinates: Coordinate[] =
          data.routes[0].geometry.coordinates.map(
            ([longitude, latitude]: [number, number]) => ({
              latitude,
              longitude,
            }),
          );

        if (!cancelled) {
          setFullRoute(coordinates);
        }
      } catch (error) {
        if (!cancelled) {
          console.log("Route error:", error);
          setFullRoute([restaurantLocation, customerLocation]);
        }
      }
    };

    getRoute();

    return () => {
      cancelled = true;
    };
  }, [restaurantLocation, customerLocation]);

  useEffect(() => {
    if (
      !map_ref.current ||
      !restaurantLocation ||
      !customerLocation ||
      has_fitted_route.current
    ) {
      return;
    }

    has_fitted_route.current = true;
    map_ref.current.fitToCoordinates(
      [restaurantLocation, customerLocation],
      {
        edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
        animated: true,
      },
    );
  }, [restaurantLocation, customerLocation, fullRoute]);

  useEffect(() => {
    if (!map_ref.current || !courierLocation || !has_fitted_route.current) {
      return;
    }

    map_ref.current.animateToRegion(
      {
        latitude: courierLocation.latitude,
        longitude: courierLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      } as MapRegion,
      500,
    );

    setTrackCourierIcon(true);
    const timeout = setTimeout(() => setTrackCourierIcon(false), 400);
    return () => clearTimeout(timeout);
  }, [
    courierLocation?.latitude,
    courierLocation?.longitude,
  ]);

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
      ) : !hasGoogleMapsApiKey() ? (
        <View style={styles.loader}>
          <Text style={[styles.maps_error_title, { color: colors.text }]}>
            Google Maps API key is missing
          </Text>
          <Text style={[styles.maps_error_body, { color: colors.text }]}>
            Add GOOGLE_MAPS_API_KEY to android/local.properties, then rebuild
            the Android app.
          </Text>
        </View>
      ) : (
        <MapView
          ref={map_ref}
          style={styles.map}
          initialRegion={
            restaurantLocation
              ? {
                  ...restaurantLocation,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }
              : constants.default_map_region
          }
          showsUserLocation={showUserLocation}
          showsMyLocationButton={showUserLocation}
        >
          {fullRoute.length > 1 ? (
            <Polyline
              coordinates={fullRoute}
              strokeColor="rgba(237, 117, 80, 0.25)"
              strokeWidth={6}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}

          {remainingRoute.length > 1 ? (
            <Polyline
              coordinates={remainingRoute}
              strokeColor={ACCENT}
              strokeWidth={6}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}

          {restaurantLocation ? (
            <Marker
              coordinate={restaurantLocation}
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges={false}
              title="Restaurant"
            >
              <Image
                source={ImageLinks.restaurant_map_pin}
                style={styles.marker_image}
              />
            </Marker>
          ) : null}

          {customerLocation ? (
            <Marker
              coordinate={customerLocation}
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges={false}
              title="Delivery address"
            >
              <Image
                source={ImageLinks.location}
                style={styles.customer_marker_image}
              />
            </Marker>
          ) : null}

          {courierLocation ? (
            <Marker
              coordinate={courierLocation}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={trackCourierIcon}
              title="Delivery partner"
            >
              <Image
                source={ImageLinks.delivery_person_map_pin}
                style={styles.courier_marker_image}
              />
            </Marker>
          ) : null}
        </MapView>
      )}

      {is_delivered ? (
        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Button
            text="Done"
            type="primary"
            width="100%"
            onClick={() => navigation.navigate(constants.route_names.DeliveryStatus, { order_id })}
          />
        </View>
      ) : null}
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
    paddingHorizontal: SIZES.padding,
  },
  maps_error_title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  maps_error_body: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.75,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  marker_image: {
    width: 48,
    height: 48,
  },
  customer_marker_image: {
    width: 36,
    height: 36,
    tintColor: ACCENT,
  },
  courier_marker_image: {
    width: 56,
    height: 56,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
