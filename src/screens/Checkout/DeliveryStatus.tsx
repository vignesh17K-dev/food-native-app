import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { flatMap, head } from "lodash";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import Header from "../../components/Header";
import VerticalStepper from "../../components/VerticalStepper";
import ImageLinks from "../../../assets/ImageLink";
import constants from "../../../utils/constants";
import { COLORS, SIZES } from "../../../constants";
import { Divider, Skeleton } from "native-base";
import Button from "../../components/Button";
import type { RootState } from "../../../store/store";
import orderApi from "../../../utils/api/order";
import { setOrderDeliveryStatus } from "../../../store/slices/OrderStatusSlice";
import { getCurrencySymbol } from "../../../utils/currency";
import { ACCENT } from "../../../utils/theme/appTheme";
import { getFirstRestaurant } from "../../../utils/order/getFirstRestaurant";

const ORDER_STATUS_STEPS = constants.order_statuses.map((status) => ({
  id: status.key,
  title: status.title,
  subtitle: status.description,
}));

function get_step_index(status?: string | null) {
  if (!status) {
    return 0;
  }
  const index = ORDER_STATUS_STEPS.findIndex((step) => step.id === status);
  return index >= 0 ? index : 0;
}

/** e.g. 12 Sept 2026 / 2:00PM */
function format_estimated_delivery(value?: string | Date | null) {
  if (!value) {
    return "—";
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  const date_part = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time_part = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date_part} / ${time_part}`;
}

/** e.g. 28 Oct, 3:35 PM */
function format_order_date(value?: string | Date | null) {
  if (!value) {
    return "";
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const date_part = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  const time_part = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date_part}, ${time_part}`;
}

const DeliveryStatusSkeleton = ({
  surfaceColor,
  borderColor,
}: {
  surfaceColor: string;
  borderColor: string;
}) => (
  <View style={styles.content}>
    <Skeleton height={3} width="40%" borderRadius={8} />
    <Skeleton height={6} width="70%" borderRadius={8} mt={4} mb={4} />
    <View
      style={[
        styles.stepper_wrap,
        {
          backgroundColor: surfaceColor,
          borderColor,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.track_header}>
        <Skeleton height={4} width="35%" borderRadius={8} />
        <Skeleton height={4} width="20%" borderRadius={8} />
      </View>
      <Divider style={{ marginVertical: 20, backgroundColor: borderColor }} />
      {ORDER_STATUS_STEPS.map((step) => (
        <View key={step.id} style={styles.skeleton_step_row}>
          <Skeleton height={8} width={8} borderRadius={16} />
          <View style={styles.skeleton_step_text}>
            <Skeleton height={4} width="55%" borderRadius={8} />
            <Skeleton height={3} width="80%" borderRadius={8} mt={2} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

const DeliveryStatus = ({ navigation, route }: any) => {
  const [order_detail, set_order_detail] = useState<any>(null);
  const [is_loading, set_is_loading] = useState(true);
  const { colors, darkMode } = useAppTheme();
  const dispatch = useDispatch();
  const { order_id } = route.params ?? {};
  const order_event_from_store = useSelector((state: RootState) =>
    order_id ? state.orderStatus.statusesByOrderId[order_id] : undefined,
  );

  const is_from_my_order =
    navigation.getState().routes[navigation.getState().routes.length - 2]
      ?.name === constants.route_names.MyOrders;

  const order_status = is_from_my_order
    ? order_detail?.order_status
    : order_event_from_store?.order_status || "confirmed";
  const current_step = get_step_index(order_status);
  const estimated_delivery_time =
    order_event_from_store?.estimated_delivery_time ??
    order_detail?.estimated_delivery_time;

  const order_card = useMemo(() => {
    if (!order_detail) {
      return null;
    }

    const cart_products: any = order_detail?.cart_details?.products;
    const flattened_products = flatMap(cart_products, (product_data: any) =>
      flatMap(product_data, (item: any) => item),
    );
    const first_product = head(flattened_products);
    const restaurant_logo = first_product?.restaurant?.logo;
    const order_image =
      typeof restaurant_logo === "string" && restaurant_logo.length > 0
        ? restaurant_logo
        : first_product?.image;
    const image_source =
      typeof order_image === "string" && order_image.length > 0
        ? { uri: order_image }
        : null;
    const date_value = order_detail?.created_at || order_detail?.createdAt;
    const is_razorpay_order =
      order_detail?.payment_details?.provider === "razorpay" 

    return {
      order_id: order_detail?.order_id ?? order_id,
      amount: order_detail?.amount,
      currency_symbol: getCurrencySymbol(order_detail?.currency),
      date_label: format_order_date(date_value),
      item_count: flattened_products.length,
      image_source,
      is_razorpay_order,
    };
  }, [order_detail, order_id]);

  const handle_get_order_detail = async () => {
    if (!order_id) {
      set_is_loading(false);
      return;
    }

    try {
      set_is_loading(true);
      const response = await orderApi.get_order(order_id);
      const order = response?.data;
      const status = order?.order_status;

      set_order_detail(order);
      if (typeof status === "string" && (order?.order_id || order_id)) {
        dispatch(
          setOrderDeliveryStatus({
            ...order,
            order_id: order?.order_id ?? order_id,
            order_status: status,
            payment_status: order?.payment_status,
            amount: order?.amount,
            currency: order?.currency,
            estimated_delivery_time: order?.estimated_delivery_time ?? undefined,
            restaurant:
              order?.restaurant ??
              getFirstRestaurant(order?.cart_details?.products),
          }),
        );
      }
    } catch (error) {
      console.log("Failed to fetch order:", error);
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    handle_get_order_detail();
  }, [order_id, dispatch]);

  const handle_back_home = () => {
    if (is_from_my_order) {
      navigation.navigate(constants.route_names.MyOrders);
    } else {
      navigation.navigate(constants.route_names.Home);
    }
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

      {is_loading ? (
        <DeliveryStatusSkeleton
          surfaceColor={colors.surface}
          borderColor={
            darkMode ? "rgba(255,255,255,0.12)" : colors.border
          }
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {is_from_my_order ? (
              <Text style={[styles.title, { color: colors.text }]}>
                Delivery Completed
              </Text>
            ) : (
              <>
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
                  {format_estimated_delivery(estimated_delivery_time)}
                </Text>
              </>
            )}

            {order_card ? (
              <View
                style={[
                  styles.order_card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: darkMode
                      ? "rgba(255,255,255,0.12)"
                      : colors.border,
                  },
                ]}
              >
                <View style={styles.order_card_row}>
                  <View style={styles.order_icon_wrap}>
                    {order_card.image_source ? (
                      <Image
                        source={order_card.image_source}
                        style={styles.order_status_image}
                        resizeMode="cover"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="package-variant-closed"
                        size={22}
                        color={ACCENT}
                      />
                    )}
                  </View>
                  <View style={styles.order_info}>
                    <View style={styles.order_id_row}>
                      <Text style={[styles.order_id, { color: colors.text }]}>
                        #
                        {String(order_card.order_id)
                          .slice(-6)
                          .toUpperCase()}
                      </Text>
                      {order_card.is_razorpay_order ? (
                        <Image
                          source={ImageLinks.razorpay}
                          style={styles.razorpay_logo}
                          resizeMode="contain"
                          accessibilityLabel="Paid with Razorpay"
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.order_meta,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {order_card.date_label}
                      {order_card.item_count > 0
                        ? ` · ${order_card.item_count} items`
                        : ""}
                    </Text>
                  </View>
                  <Text style={[styles.order_total, { color: COLORS.primary }]}>
                    {order_card.currency_symbol}
                    {Number(order_card.amount ?? 0).toFixed(0)}
                  </Text>
                </View>
              </View>
            ) : null}

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
                  #
                  {String(order_detail?.order_id ?? order_id ?? "")
                    .slice(-6)
                    .toUpperCase() || "------"}
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
                steps={ORDER_STATUS_STEPS}
                currentStep={current_step}
              />
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer_button_wrap,
              is_from_my_order && { justifyContent: "center" },
              { backgroundColor: colors.background },
            ]}
          >
            {is_from_my_order ? (
              <Button
                text="Go Back"
                type="primary"
                width={SIZES.width * 0.8}
                onClick={handle_back_home}
              />
            ) : (
              <>
                <Button
                  text="Go Back"
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
                  onClick={() =>
                    navigation.navigate(constants.route_names.MapView)
                  }
                />
              </>
            )}
          </View>
        </>
      )}
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
    paddingBottom: 120,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 15,
  },
  order_card: {
    width: "100%",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginTop: 4,
  },
  order_card_row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  order_icon_wrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  order_status_image: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  order_info: {
    flex: 1,
    gap: 3,
  },
  order_id_row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  order_id: {
    fontSize: 15,
    fontWeight: "700",
  },
  razorpay_logo: {
    width: 56,
    height: 18,
  },
  order_meta: {
    fontSize: 14,
    fontWeight: "500",
  },
  order_total: {
    fontSize: 18,
    fontWeight: "700",
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
  skeleton_step_row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 22,
  },
  skeleton_step_text: {
    flex: 1,
    paddingTop: 4,
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
