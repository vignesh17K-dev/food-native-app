import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import { Skeleton } from "native-base";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import constants from "../../../utils/constants";
import { ensureProductsMap, remove_cart_item, set_cart, upsert_cart_item } from "../../../store/slices/CartSlice";
import cart from "../../../utils/api/cart";
import { calculateCartSubtotal } from "../../../utils/cart/cartTotals";
import {
  flattenCartProducts,
  type CartLineItem,
} from "../../../utils/cart/flattenCartProducts";
import CartLineItemCard from "../../components/CartLineItemCard";
import { debounce } from "lodash";
import { store } from "../../../store/store";
import { applyCartItemResponse } from "../../../utils/cart/applyCartItemResponse";

const Cart = ({ navigation }: any) => {
  const { colors, darkMode } = useAppTheme();
  const checkout_footer_background = darkMode
    ? colors.surface
    : colors.surfaceElevated;
  const [loading, set_loading] = useState(true);
  const [delete_loading, set_delete_loading] = useState(false);
  const [add_to_cart_loading, set_add_to_cart_loading] = useState(false)
  const dispatch = useDispatch();
  const cart_data = useSelector((state: any) => state?.cart?.cart_data);
  const cart_id = cart_data?.cart_id;
  const pending_quantity_ref = useRef<number | null>(null);
  const QUANTITY_SYNC_DEBOUNCE_MS = 500;


  const cart_products = cart_data?.products;
  const cart_items = useMemo(
    () => flattenCartProducts(cart_products),
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


  const sync_cart_quantity_api = useRef(
    debounce(async (product_id: string, cart_item_id: string) => {
      const quantity = pending_quantity_ref.current;
      if (quantity == null || quantity <= 0) {
        return;
      }

      const cart_state = (store.getState() as { cart?: { cart_data?: any } })
        ?.cart?.cart_data;
      const cart_id = cart_state?.cart_id;
      if (!cart_id) {
        return;
      }

      const products = ensureProductsMap(cart_state?.products);
      const line = Object.values(products[product_id] ?? {}).find(
        (entry) => entry.cart_item_id === cart_item_id,
      );
      if (!line?.cart_item_id) {
        return;
      }

      set_add_to_cart_loading(true);
      try {
        const response = await cart.update_cart_item({
          cart_item_id: line.cart_item_id,
          quantity,
          cart_id,
          product_id,
        });
        const cart_item = response?.data ?? response;
        const product_snapshot = (store.getState() as any)?.cart?.cart_data;

        dispatch(
          upsert_cart_item(
            applyCartItemResponse({
              response: cart_item,
              products: product_snapshot?.products,
              submittedProductId: product_id,
              submittedCartItemId: line.cart_item_id,
              display: {
                name: line.name,
                price: line.price,
                image: line.image,
              },
            }),
          ),
        );
      } catch (error) {
        console.log(error);
      } finally {
        set_add_to_cart_loading(false);
      }
    }, QUANTITY_SYNC_DEBOUNCE_MS),
  ).current;


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


  const handle_update_quantity = useCallback((item: CartLineItem, quantity: number) => {
    if (quantity <= 0) {
      sync_cart_quantity_api.cancel();
      pending_quantity_ref.current = null;
      handle_delete(item)
      return;
    }

    pending_quantity_ref.current = quantity;

    dispatch(
      upsert_cart_item({
        product_id: item?.product_id,
        cart_item_id: item?.cart_item_id,
        quantity: quantity,
      }),
    );

    sync_cart_quantity_api(item?.product_id, item?.cart_item_id);

  }, [sync_cart_quantity_api])



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

  useFocusEffect(
    useCallback(() => {
      handle_get_cart_details();
    }, [handle_get_cart_details]),
  );

  useEffect(() => {
    return () => {
      sync_cart_quantity_api.flush();
      sync_cart_quantity_api.cancel();
    };
  }, [sync_cart_quantity_api]);

  const render_item = ({ item }: { item: CartLineItem }) => (
    <CartLineItemCard
      item={item}
      editable
      onPress={() => handle_open_product(item)}
      onQuantityChange={(count) => handle_update_quantity(item, count)}
      onDelete={() => handle_delete(item)}
      deleteLoading={delete_loading}
      quantityDisabled={add_to_cart_loading}
    />
  );

  const render_skeleton = () => (
    <View style={styles.skeleton_container}>
      {[1, 2, 3, 4]?.map((item) => (
        <View
          key={item}
          style={[styles.skeleton_item, { backgroundColor: colors.surface }]}
        >
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
          <View style={[styles.empty_glow, { backgroundColor: colors.accentSoft }]}>
            <View style={styles.empty_icon_circle}>
              <Image source={ImageLinks.cart} style={styles.empty_cart_icon} />
            </View>
          </View>

          <Text style={[styles.empty_title, { color: colors.text }]}>
            Hungry? Your cart is empty
          </Text>
          <Text style={[styles.empty_subtitle, { color: colors.textSecondary }]}>
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
      <Text
        style={[
          styles.summary_label,
          { color: colors.text },
          bold && styles.summary_bold,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.summary_value,
          { color: colors.text },
          bold && styles.summary_bold,
        ]}
      >
        ${amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <ThemedScreen>
      <Header
        container_style={{
          marginRight: 18,
          marginHorizontal: SIZES.width * 0.02,
          marginBottom: 10,
        }}
        title={
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
            Cart
          </Text>
        }
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
        <View
          style={[
            styles.checkout_footer,
            {
              backgroundColor: checkout_footer_background,
              borderTopColor: colors.border,

              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            },
          ]}
        >
          {render_summary_row("Subtotal", cart_subtotal)}
          {render_summary_row("Shipping fee", shipping_fee)}
          <View
            style={[styles.summary_divider, { backgroundColor: colors.border }]}
          />
          {render_summary_row("Total:", cart_total, true)}
          <TouchableOpacity
            style={styles.place_order_btn}
            activeOpacity={0.85}
            onPress={() => {
              navigation.navigate(constants.route_names.Checkout);
            }}
          >
            <Text style={styles.place_order_text}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </ThemedScreen>
  );
};

export default Cart;

const styles = StyleSheet.create({
  checkout_footer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8
  },
  summary_row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summary_label: {
    fontSize: 16,
    fontWeight: "400",
  },
  summary_value: {
    fontSize: 16,
    fontWeight: "700",
  },
  summary_bold: {
    fontWeight: "700",
    fontSize: 17,
  },
  summary_divider: {
    height: StyleSheet.hairlineWidth,
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
  skeleton_container: {
    marginHorizontal: 20,
    gap: 12,
  },
  skeleton_item: {
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
    textAlign: "center",
    marginBottom: 10,
  },
  empty_subtitle: {
    fontSize: 15,
    fontWeight: "400",
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
