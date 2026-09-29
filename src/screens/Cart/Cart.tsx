import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "native-base";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import constants from "../../../utils/constants";
import { remove_cart_item, set_cart } from "../../../store/slices/CartSlice";
import cart from "../../../utils/api/cart";
import {
  calculateCartSubtotal,
  calculateLineTotal,
} from "../../../utils/cart/cartTotals";
import Counter from "../../components/Counter";

type CartLineItem = {
  product_id: string;
  cart_item_id: string;
  id?: string;
  name?: string;
  image?: string;
  price?: number;
  quantity?: number;
  selectedSize?: string;
  products?: CartProductsMap;
};

type CartProductsMap = Record<
  string,
  Record<string, Omit<CartLineItem, "product_id" | "cart_item_id">>
>;

const flatten_cart_products = (
  products: CartProductsMap | CartLineItem[] | null | undefined,
): CartLineItem[] => {
  if (!products) {
    return [];
  }

  if (Array.isArray(products)) {
    return products;
  }

  return Object.entries(products).flatMap(([product_id, variants]) => {
    if (!variants || typeof variants !== "object") {
      return [];
    }

    return Object.entries(variants).map(([cart_item_id, item]) => ({
      product_id,
      cart_item_id,
      ...item,
    }));
  });
};

const Cart = ({ navigation }: any) => {
  const [loading, set_loading] = useState(true);
  const [delete_loading, set_delete_loading] = useState(false);
  const dispatch = useDispatch();
  const cart_data = useSelector((state: any) => state?.cart?.cart_data);
  const cart_id = cart_data?.cart_id;

  const cart_products = cart_data?.products;
  const cart_items = useMemo(
    () => flatten_cart_products(cart_products),
    [cart_products],
  );

  const cart_subtotal = useMemo(
    () => calculateCartSubtotal(cart_items),
    [cart_items],
  );

  const shipping_fee = 0;
  const cart_total = cart_subtotal + shipping_fee;

  const handle_get_cart_details = useCallback(async () => {
    if (!cart_id) {
      set_loading(false);
      return;
    }

    set_loading(true);
    try {
      const response = await cart.get_cart_details(cart_id);
      const cart_data_response = response?.data ?? response;
      dispatch(set_cart(cart_data_response));
    } catch (error) {
      console.error("Get Cart Details Error:", error);
    } finally {
      set_loading(false);
    }
  }, [cart_id, dispatch]);

  useFocusEffect(
    useCallback(() => {
      handle_get_cart_details();
    }, [handle_get_cart_details]),
  );

  const handle_delete_cart_item = async (data: any) => {
    set_delete_loading(true);
    try {
      await cart.delete_cart_item(data);
      dispatch(
        remove_cart_item({
          product_id: data.product_id,
          cart_item_id: data.cart_item_id,
        }),
      );
    } catch (error) {
      console.error("Delete Cart Item Error:", error);
    } finally {
      set_delete_loading(false);
    }
  };

  const handle_delete = (item: CartLineItem) => {
    const data = {
      cart_item_id: item?.cart_item_id,
      product_id: item?.product_id,
      cart_id: cart_id,
    };
    handle_delete_cart_item(data);
  };

  const handle_open_product = useCallback(
    (item: CartLineItem) => {
      const productId = item.product_id ?? item.id;
      if (!productId) {
        return;
      }
      navigation.navigate(constants.route_names.ProductDetails, {
        id: String(productId),
      });
    },
    [navigation],
  );

  const handle_render_item = (item: CartLineItem) => {
    const line_total = calculateLineTotal(item);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.cart_item_main}
        onPress={() => handle_open_product(item)}
      >
        <View style={styles.item_row}>
          <Image src={item?.image} style={styles.item_image} alt="img" />

          <View style={styles.item_info}>
            <Text
              style={styles.cart_name}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item?.name}
            </Text>
            {!!item?.selectedSize && (
              <Text style={styles.item_meta}>Size: {item.selectedSize}</Text>
            )}
            <Text style={styles.cart_price}>${line_total.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const render_item = ({ item }: { item: CartLineItem }) => {
    const translateX = new Animated.Value(0);
    const pan_responder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dx) > 8 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_evt, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx < -50) {
          Animated.spring(translateX, {
            toValue: -110,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    return (
      <View style={{ flexDirection: "row" }}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          <View {...pan_responder.panHandlers} style={styles.cart_item}>
            {handle_render_item(item)}
            <Counter from_cart value={item?.quantity ?? 1} />
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.delete_btn}
          onPress={() => handle_delete(item)}
        >
          {delete_loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.delete_text}>Delete</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const render_skeleton = () => (
    <View style={styles.skeleton_container}>
      {[1, 2, 3, 4]?.map((item) => (
        <View key={item} style={styles.skeleton_item}>
          <Skeleton
            height={SIZES.height * 0.1}
            width={SIZES.width * 0.2}
            borderRadius={10}
          />
          <View style={styles.skeleton_text_wrap}>
            <Skeleton height={4} width="70%" borderRadius={8} />
            <Skeleton height={3} width="40%" borderRadius={8} mt={2} />
          </View>
          <Skeleton height={10} width={SIZES.width * 0.25} borderRadius={10} />
        </View>
      ))}
    </View>
  );

  const render_content = () => {
    if (loading) {
      return render_skeleton();
    }

    if (cart_items.length === 0) {
      return (
        <View style={styles.empty_wrap}>
          <View style={styles.empty_glow}>
            <View style={styles.empty_icon_circle}>
              <Image source={ImageLinks.cart} style={styles.empty_cart_icon} />
            </View>
          </View>

          <Text style={styles.empty_title}>Hungry? Your cart is empty</Text>
          <Text style={styles.empty_subtitle}>
            Browse delicious meals and add your favorites to get started.
          </Text>

          <TouchableOpacity
            style={styles.empty_cta}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(constants.route_names.Home)}
          >
            <Text style={styles.empty_cta_text}>Browse Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.empty_secondary}
            onPress={() => navigation.navigate(constants.route_names.Search)}
          >
            <Text style={styles.empty_secondary_text}>Search food</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={cart_items}
        renderItem={render_item}
        keyExtractor={(item) =>
          `${item.product_id}-${item.cart_item_id}-${item.selectedSize ?? ""}`
        }
        contentContainerStyle={[
          styles.cart_container,
          styles.cart_container_with_footer,
        ]}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const render_summary_row = (label: string, amount: number, bold = false) => (
    <View style={styles.summary_row}>
      <Text style={[styles.summary_label, bold && styles.summary_bold]}>
        {label}
      </Text>
      <Text style={[styles.summary_value, bold && styles.summary_bold]}>
        ${amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        backgroundColor: "#fff",
        flex: 1,
      }}
    >
      <Header
        container_style={{
          marginRight: 18,
          marginHorizontal: SIZES.width * 0.02,
          marginBottom: 10,
        }}
        title={<Text style={{ fontSize: 20, fontWeight: "700" }}>Cart</Text>}
        left_section={
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={ImageLinks?.back_arrow}
              style={{
                resizeMode: "contain",
                height: SIZES.height * 0.04,
              }}
              alt="logo"
            />
          </TouchableOpacity>
        }
        right_section={null}
      />

      {render_content()}

      {!loading && cart_items.length > 0 && (
        <View style={styles.checkout_footer}>
          {render_summary_row("Subtotal", cart_subtotal)}
          {render_summary_row("Shipping fee", shipping_fee)}
          <View style={styles.summary_divider} />
          {render_summary_row("Total:", cart_total, true)}
          <TouchableOpacity
            style={styles.place_order_btn}
            activeOpacity={0.85}
            onPress={() => {}}
          >
            <Text style={styles.place_order_text}>Place your Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  checkout_footer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  summary_row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summary_label: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "400",
  },
  summary_value: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "700",
  },
  summary_bold: {
    fontWeight: "700",
    fontSize: 17,
  },
  summary_divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  place_order_btn: {
    marginTop: 16,
    backgroundColor: "#ed7550",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  place_order_text: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  cart_container: {
    gap: 12,
    marginHorizontal: 20,
  },
  cart_container_with_footer: {
    paddingBottom: 220,
  },
  cart_item: {
    backgroundColor: "#f6f6f8",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: SIZES.width - 40,
  },
  cart_item_main: {
    flex: 1,
    minWidth: 0,
  },
  item_row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  item_image: {
    resizeMode: "contain",
    height: SIZES.height * 0.1,
    width: SIZES.width * 0.2,
  },
  item_info: {
    justifyContent: "center",
    gap: 4,
  },
  cart_name: {
    fontSize: 18,
    width: 180,
  },
  item_meta: {
    fontSize: 13,
    color: "#888",
  },
  cart_price: {
    color: "#ed7550",
    fontSize: 16,
    fontWeight: "700",
  },
  delete_btn: {
    justifyContent: "center",
    backgroundColor: "#ed7550",
    width: 100,
    alignItems: "center",
    borderRadius: 12,
    position: "absolute",
    right: 0,
    height: "100%",
    zIndex: -1,
  },
  delete_text: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },
  skeleton_container: {
    marginHorizontal: 20,
    gap: 12,
  },
  skeleton_item: {
    backgroundColor: "#f6f6f8",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  skeleton_text_wrap: {
    flex: 1,
    justifyContent: "center",
  },
  empty_wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: SIZES.height * 0.06,
  },
  empty_glow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#fff3ee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  empty_icon_circle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#ed7550",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ed7550",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  empty_cart_icon: {
    width: 44,
    height: 44,
    tintColor: "#fff",
    resizeMode: "contain",
  },
  empty_title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 10,
  },
  empty_subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: "#8a8a8a",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 280,
  },
  empty_cta: {
    backgroundColor: "#ed7550",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    minWidth: 200,
    alignItems: "center",
  },
  empty_cta_text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  empty_secondary: {
    marginTop: 16,
    paddingVertical: 8,
  },
  empty_secondary_text: {
    color: "#ed7550",
    fontSize: 15,
    fontWeight: "600",
  },
});
