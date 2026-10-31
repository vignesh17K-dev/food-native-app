import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "../../components/Header";
import ImageLinks from "../../../assets/ImageLink";
import { COLORS, SIZES } from "../../../constants";
import constants from "../../../utils/constants";
import orderApi from "../../../utils/api/order";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ACCENT } from "../../../utils/theme/appTheme";
import { flatMap, head } from "lodash";
import Button from "../../components/Button";
import { getCurrencySymbol } from "../../../utils/currency";

type OrderItem = {
  user_id?: string;
  currency?: string;
  cart_details?: {
    products?: {
      name?: string;
      quantity?: number;
      price?: number;
    }[];
  };
  payment_details:{
    provider?: string;
    order_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    created_at?: string;
  }
  id?: string;
  _id?: string;
  order_id?: string;
  razorpayOrderId?: string;
  payment_status?: string;
  provider?: string;
  total?: number;
  amount?: number;
  created_at?: string;
  createdAt?: string;
};

/** e.g. 28 Oct, 3:35 PM */
function formatOrderDate(value: string) {
  const d = new Date(value);
  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

const MyOrders = ({ navigation }: any) => {
  const { colors, darkMode } = useAppTheme();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        setLoading(true);
        try {
          const response = await orderApi.get_orders();
          const list = response?.data;
          if (!cancelled) {
            setOrders(Array.isArray(list) ? list : []);
          }
        } catch {
          if (!cancelled) {
            setOrders([]);
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
    }, []),
  );

  const render_order = ({ item }: { item: OrderItem }) => {
    const orderId = item?.order_id;
    const total = item?.amount;
    const date_value = item.created_at || item.createdAt;
    const cart_products: any = item?.cart_details?.products;
    const currencySymbol = getCurrencySymbol(item?.currency);
    const is_razorpay_order = Boolean(item?.payment_details?.provider === "razorpay");

    const flattened_products = flatMap(cart_products, (product_data: any) => {
      return flatMap(product_data, (item: any) => {
        return item;
      });
    });

    const order_image = head(flattened_products)?.image;
    const image_source =
      typeof order_image === "string" && order_image.length > 0
        ? { uri: order_image }
        : null;

    return (
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

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={[styles.icon_wrap]}>
            {image_source ? (
              <Image
                source={image_source}
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
                #{String(orderId).slice(-6).toUpperCase()}
              </Text>
              {is_razorpay_order ? (
                <Image
                  source={ImageLinks.razorpay}
                  style={styles.razorpay_logo}
                  resizeMode="contain"
                  accessibilityLabel="Paid with Razorpay"
                />
              ) : null}
            </View>
            <Text style={[styles.order_meta, { color: colors.textSecondary }]}>
              {date_value ? `${formatOrderDate(date_value)}` : ""}
              {flattened_products.length > 0
                ? ` · ${flattened_products.length} items`
                : ""}
            </Text>
          </View>

          <Text style={[styles.order_total, { color: COLORS.primary }]}>
            {currencySymbol}{Number(total).toFixed(0)}
          </Text>
        </View>


        <View style={{ flexDirection: "row", width: '100%', justifyContent: 'space-between' }}>
          <Button text="View Order" type="primary" width={SIZES.width * 0.40} onClick={() => navigation.navigate(constants.route_names.DeliveryStatus, { order_id: orderId })} />
          <Button text="Rate" type="soft" width={SIZES.width * 0.40} onClick={() => { }} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safe_area, { backgroundColor: colors.background }]}
    >
      <Header
        container_style={styles.header_container}
        title={
          <Text style={[styles.header_title, { color: colors.text }]}>
            My Orders
          </Text>
        }
        left_section={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={ImageLinks.back_arrow}
              style={[
                styles.back_arrow,
                darkMode && { tintColor: COLORS.primary },
              ]}
              alt="back"
            />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) =>
            String(item.order_id || item.id || item._id || index)
          }
          renderItem={render_order}
          contentContainerStyle={[
            styles.list_content,
            orders.length === 0 && styles.list_empty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="package-variant"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.empty_title, { color: colors.text }]}>
                No orders yet
              </Text>
              <Text
                style={[styles.empty_subtitle, { color: colors.textSecondary }]}
              >
                Your past and active orders will show up here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
  },
  order_status_image: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  icon_wrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  header_container: {
    marginRight: 18,
    marginHorizontal: SIZES.width * 0.02,
    marginTop: 12,
    marginBottom: 12,
  },
  header_title: {
    fontSize: 20,
    fontWeight: "700",
  },
  back_arrow: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list_content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  list_empty: {
    flexGrow: 1,
  },
  order_card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
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
    height: 18,  },
  order_meta: {
    fontSize: 14,
    fontWeight: "500",
  },
  order_total: {
    fontSize: 18,
    fontWeight: "700",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  empty_title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  empty_subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
