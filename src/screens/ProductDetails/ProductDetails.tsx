import { Image, Skeleton, Text, View } from "native-base";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import CartIcon from "../../components/CartIcon";
import product from "../../../utils/api/product";
import { FontAwesome } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Fontisto from "react-native-vector-icons/Fontisto";
import { debounce, find, map } from "lodash";
import {
  add_to_wishlist_action,
  remove_from_wishlist_action,
} from "../../../actions/wishlist";
import { update_wishlist } from "../../../store/slices/WishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import Counter from "../../components/Counter";
import { LayoutChangeEvent } from "react-native";
import cart from "../../../utils/api/cart";
import {
  ensureProductsMap,
  remove_cart_item,
  upsert_cart_item,
} from "../../../store/slices/CartSlice";
import { applyCartItemResponse } from "../../../utils/cart/applyCartItemResponse";
import { store } from "../../../store/store";

const QUANTITY_SYNC_DEBOUNCE_MS = 500;

const ProductDetails = ({ route, navigation }: any) => {
  const { colors, darkMode } = useAppTheme();
  const footer_background = darkMode ? colors.surface : colors.surfaceElevated;
  const { id } = route.params;
  const [loading, set_loading] = useState(false);
  const [product_details, set_product_details] = useState<any>({});
  const [selected_size, set_selected_size] = useState<any>(null);
  const [add_to_cart_loading, set_add_to_cart_loading] = useState(false);
  const dispatch = useDispatch();

  const [footer_height, set_footer_height] = useState(0);
  const cart_data = useSelector((state: any) => state?.cart?.cart_data);

  const handleFooterLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    set_footer_height(height);
  }, []);

  const wishlist_data = useSelector(
    (state: any) => state.wishlist.wishlist_data,
  );

  const is_favorite = find(
    wishlist_data,
    (wishlist: any) => wishlist?.id === product_details?.id,
  );

  const cart_line_for_selection = useMemo(() => {
    if (!product_details?.id) {
      return null;
    }
    const products = ensureProductsMap(cart_data?.products);
    const variants = products?.[product_details.id];
    if (!variants) {
      return null;
    }
    return (
      Object.values(variants).find(
        (line) => line.selectedSize === selected_size,
      ) ?? null
    );
  }, [cart_data?.products, product_details?.id, selected_size]);

  const cart_quantity = cart_line_for_selection?.quantity ?? 0;
  const is_in_cart = cart_quantity > 0;
  const pending_quantity_ref = useRef<number | null>(null);

  const sync_cart_quantity_api = useRef(
    debounce(async (product_id: string, size: string) => {
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
        (entry) => entry.selectedSize === size,
      );
      if (!line?.cart_item_id) {
        return;
      }

      set_add_to_cart_loading(true);
      try {
        const response = await cart.update_cart_item({
          cart_item_id: line.cart_item_id,
          quantity,
          selectedSize: size,
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
              submittedSize: size,
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

  useEffect(() => {
    return () => {
      sync_cart_quantity_api.flush();
      sync_cart_quantity_api.cancel();
    };
  }, [sync_cart_quantity_api]);

  const product_info = useMemo(() => {
    const product_info_arr = [
      {
        icon: <Fontisto name="star" color="white" size={22} />,
        text: product_details?.rating,
        style: {
          backgroundColor: "#ed7550",
          padding: 10,
          borderRadius: 15,
        },
        text_style: { color: "white" },
      },
      {
        icon: (
          <MaterialCommunityIcons
            name="clock-time-four-outline"
            color={colors.icon}
            size={24}
          />
        ),
        text: product_details?.deliveryTime,
        style: {},
        text_style: {},
      },
    ];

    if (product_details?.isFreeShipping) {
      product_info_arr.push({
        icon: <Fontisto name="dollar" color={colors.icon} size={20} />,
        text: "Free shipping",
        style: {},
        text_style: {},
      });
    }
    return product_info_arr;
  }, [product_details, colors.icon]);

  const handle_get_details = async () => {
    try {
      set_loading(true);
      const response = await product.get_product_details(id);
      set_product_details(response?.data);
      set_selected_size(response?.data?.sizes?.[0]);
    } catch (error) {
      console.log(error);
    } finally {
      set_loading(false);
    }
  };

  const debounced_ref = useRef(
    debounce((product_id: string, exists: any, dispatch: any, data: any) => {
      if (exists) {
        dispatch(remove_from_wishlist_action(product_id, data));
      } else {
        dispatch(add_to_wishlist_action(product_id));
      }
    }, 2000),
  );

  const handle_favorite = (data: any) => {
    const product_id_exist = find(
      wishlist_data,
      (item: any) => item?.id === data?.id,
    );
    dispatch(update_wishlist(data));
    debounced_ref.current(data?.id, product_id_exist, dispatch, data);
  };

  useEffect(() => {
    handle_get_details();
  }, [id]);

  const handle_render_icon = (
    icon: any,
    text: string,
    style?: any,
    text_style?: any,
    index?: number,
  ) => {
    return (
      <View
        key={`text-${index}-${icon}`}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          ...style,
        }}
      >
        {icon}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            color: colors.text,
            ...text_style,
          }}
        >
          {text}
        </Text>
      </View>
    );
  };

  const handle_render_product_image = () => {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 15,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image
              source={ImageLinks.calories}
              style={styles.icon_style}
              alt="image"
            />

            <Text style={styles.calories}>
              {product_details?.calories} Calories
            </Text>
          </View>

          <TouchableOpacity onPress={() => handle_favorite(product_details)}>
            <FontAwesome
              name={is_favorite ? "heart" : "heart-o"}
              size={20}
              color={is_favorite ? "#ff6e4d" : "grey"}
            />
          </TouchableOpacity>
        </View>

        <Image
          src={product_details?.image}
          style={
            product_details?.style ? product_details?.style : styles.image_style
          }
          alt="product"
        />
      </View>
    );
  };

  const handle_render_product_info = () => {
    return (
      <View
        style={{
          paddingVertical: 20,
          gap: 10,
        }}
      >
        <Text
          style={{
            fontSize: 38,
            fontWeight: "800",
            lineHeight: 40,
            color: colors.text,
          }}
        >
          {product_details?.name}
        </Text>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            lineHeight: 40,
            color: colors.text,
          }}
        >
          ${product_details?.price}
        </Text>

        <Text
          style={{
            fontSize: 18,
            color: colors.textSecondary,
            lineHeight: 28,
            fontWeight: "500",
            textAlign: "justify",
          }}
        >
          {product_details?.fullDescription}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            gap: 15,
          }}
        >
          {map(product_info, (item, index) => {
            return handle_render_icon(
              item?.icon,
              item?.text,
              item?.style,
              item?.text_style,
              index,
            );
          })}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
            Sizes:
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 15,
            }}
          >
            {map(product_details?.sizes, (size) => {
              const is_selected = selected_size === size;

              return (
                <TouchableOpacity
                  key={size}
                  style={
                    is_selected
                      ? styles.active_size
                      : [
                          styles.size,
                          {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                          },
                        ]
                  }
                  onPress={() => set_selected_size(size)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: is_selected ? "#ffffff" : colors.fieldText,
                    }}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const handle_render_skeleton = () => {
    return (
      <View style={{ padding: 20, gap: 20 }}>
        <View>
          <Skeleton height={250} width={"100%"} borderRadius={10} />
        </View>

        <Skeleton variant={"text"} height={5} width={"60%"} borderRadius={10} />

        <Skeleton
          variant={"text"}
          height={150}
          width={"100%"}
          borderRadius={10}
        />

        <Skeleton
          variant={"text"}
          height={5}
          width={"100%"}
          borderRadius={10}
        />

        <View style={{ flexDirection: "row", gap: 15 }}>
          <Skeleton height={50} width={20} borderRadius={10} />

          <Skeleton height={50} width={20} borderRadius={10} />
          <Skeleton height={50} width={20} borderRadius={10} />
        </View>
      </View>
    );
  };

  const handle_add_products_to_cart = async () => {
    if (add_to_cart_loading) return;
    set_add_to_cart_loading(true);
    try {
      const payload = {
        product_id: product_details?.id,
        quantity: 1,
        selectedSize: selected_size,
        cart_id: cart_data?.cart_id,
      };
      const response = await cart.add_to_cart(payload);
      const cart_item = response?.data ?? response;

      dispatch(
        upsert_cart_item(
          applyCartItemResponse({
            response: cart_item,
            products: cart_data?.products,
            submittedProductId: product_details?.id,
            submittedSize: selected_size,
            display: {
              name: product_details?.name,
              price: product_details?.price,
              image: product_details?.image,
            },
          }),
        ),
      );
    } catch (error) {
      console.log(error);
    } finally {
      set_add_to_cart_loading(false);
    }
  };

  const handle_add_to_cart = () => {
    handle_add_products_to_cart();
  };

  const handle_quantity_change = useCallback(
    (next_quantity: number) => {
      const line = cart_line_for_selection;
      const cart_item_id = line?.cart_item_id;
      const product_id = product_details?.id;
      const cart_id = cart_data?.cart_id;
      if (!cart_item_id || !product_id || !cart_id) {
        return;
      }

      if (next_quantity <= 0) {
        sync_cart_quantity_api.cancel();
        pending_quantity_ref.current = null;

        dispatch(
          remove_cart_item({
            product_id,
            cart_item_id,
          }),
        );

        set_add_to_cart_loading(true);
        void (async () => {
          try {
            await cart.delete_cart_item({
              cart_item_id,
              product_id,
              cart_id,
            });
          } catch (error) {
            console.log(error);
          } finally {
            set_add_to_cart_loading(false);
          }
        })();
        return;
      }

      pending_quantity_ref.current = next_quantity;
      dispatch(
        upsert_cart_item({
          product_id,
          cart_item_id,
          quantity: next_quantity,
          selectedSize: selected_size,
          name: product_details?.name,
          price: product_details?.price,
          image: product_details?.image,
        }),
      );
      sync_cart_quantity_api(product_id, selected_size);
    },
    [
      cart_data?.cart_id,
      cart_line_for_selection,
      dispatch,
      product_details,
      selected_size,
      sync_cart_quantity_api,
    ],
  );

  const handle_cart_btn = () => {
    const unit_price = product_details?.price ?? 0;

    return (
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={handle_add_to_cart}
        disabled={add_to_cart_loading}
      >
        <View
          style={[
            styles.cart_btn,
            add_to_cart_loading && styles.cart_btn_loading,
          ]}
        >
          {add_to_cart_loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                Add to Cart
              </Text>
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                ${unit_price}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
            DETAILS
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
        right_section={<CartIcon />}
      />

      {loading ? (
        handle_render_skeleton()
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: footer_height,
            }}
            showsVerticalScrollIndicator={false}
          >
            {handle_render_product_image()}
            {handle_render_product_info()}
          </ScrollView>

          <View
            style={[
              styles.footer_section,
              {
                backgroundColor: footer_background,
                borderTopColor: colors.border,
              },
            ]}
            onLayout={handleFooterLayout}
          >
            {is_in_cart ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                }}
              >
                <Counter
                  value={cart_quantity}
                  onChange={handle_quantity_change}
                  minCount={0}
                  disable_increment={add_to_cart_loading}
                  disable_decrement={add_to_cart_loading}
                  from_cart={darkMode}
                  style={{ flex: 1 }}
                />

                <View style={styles.price_container}>
                  <Image
                    source={ImageLinks.cart}
                    alt="cart"
                    style={[
                      styles.cart_image,
                      {
                        tintColor: darkMode ? "#ffffff" : colors.icon,
                      },
                    ]}
                  />

                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      marginLeft: 10,
                      color: colors.text,
                    }}
                  >
                    ${Math.floor(cart_quantity * product_details?.price)?.toFixed(2)}
                  </Text>
                </View>
              </View>
            ) : (
              handle_cart_btn()
            )}
          </View>
        </>
      )}
    </ThemedScreen>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  image_style: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    resizeMode: "contain",
  },

  price_container: {
    // backgroundColor: "#ed7550",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
  },

  cart_image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  footer_section: {
    shadowColor: "rgba(0,0,0,0.25)",
    shadowOffset: {
      width: 0,
      height: -15,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.height * 0.03,
    flexDirection: "row",
    gap: 20,
  },

  calories: {
    fontSize: 14,
    color: "grey",
  },

  icon_style: {
    resizeMode: "contain",
    height: SIZES.height * 0.03,
    width: SIZES.width * 0.03,
    paddingHorizontal: 15,
    marginTop: 5,
  },

  size: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderStyle: "solid",
  },

  active_size: {
    backgroundColor: "#ed7550",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  cart_btn: {
    backgroundColor: "#ed7550",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    width: "100%",
    minHeight: 62,
  },
  cart_btn_loading: {
    justifyContent: "center",
  },
});
