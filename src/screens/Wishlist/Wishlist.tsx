import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
  Animated,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import CartIcon from "../../components/CartIcon";
import Button from "../../components/Button";
import { remove_from_wishlist_action } from "../../../actions/wishlist";
import { update_wishlist } from "../../../store/slices/WishlistSlice";
import constants from "../../../utils/constants";
import cart from "../../../utils/api/cart";
import { upsert_cart_item } from "../../../store/slices/CartSlice";
import { applyCartItemResponse } from "../../../utils/cart/applyCartItemResponse";
import { head } from "lodash";
import { SafeAreaView } from "react-native-safe-area-context";

interface PayloadProps {
  product_id: string,
  quantity: number
  selectedSize: string
  cart_id: string
}

const Wishlist = ({ navigation }: any) => {
  const [add_to_cart_loading, set_add_to_cart_loading] = useState(false)
  const wishlist_data = useSelector(
    (state: any) => state?.wishlist?.wishlist_data
  );
  const cart_data = useSelector((state: any) => state?.cart?.cart_data);
  const cart_products = cart_data?.products;
  const dispatch = useDispatch<any>();


  const handle_delete = (item: any) => {
    dispatch(update_wishlist(item));
    dispatch(remove_from_wishlist_action(item?.id, item));
  };


  const handle_add_products_to_cart = async (product: any) => {
    if (add_to_cart_loading) return;

    set_add_to_cart_loading(true);
    try {
      const payload: PayloadProps = {
        product_id: product?.id,
        quantity: 1,
        selectedSize: head(product?.sizes),
        cart_id: cart_data?.cart_id,
      };

      const response = await cart.add_to_cart(payload);
      const cart_item = response?.data ?? response;

      dispatch(
        upsert_cart_item(
          applyCartItemResponse({
            response: cart_item,
            products: cart_data?.products,
            submittedProductId: product?.id,
            submittedSize: product?.selected_size,
            display: {
              name: product?.name,
              price: product?.price,
              image: product?.image,
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


  const handle_render_item = (item: any, is_product_in_cart: boolean) => {
    return (
      <React.Fragment>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(constants.route_names.ProductDetails, {
              id: item?.id,
            });
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Image
              src={item?.image}
              style={{
                resizeMode: "contain",
                marginTop: 10,
                height: SIZES.height * 0.1,
                width: SIZES.width * 0.2,
              }}
              alt="img"
            />

            <View
              style={{
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Text
                style={styles.wishlist_name}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item?.name}
              </Text>
              <Text style={styles.wishlist_price}>${item?.price}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {!is_product_in_cart ? <Button
          loading={add_to_cart_loading}
          onClick={() => handle_add_products_to_cart(item)}
          text={"Add To Cart"}
          type="primary"
          style={{
            marginHorizontal: 5,
          }}
          width={SIZES.width * 0.3}
        /> : <View style={{
          width: SIZES.width * 0.3
        }} />}
      </React.Fragment>
    );
  };

  const render_item = ({ item }: any) => {
    const translateX = new Animated.Value(0);
    const pan_responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
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

    const is_product_in_cart = cart_products?.[item?.id] ? true : false;

    return (
      <View style={{ flexDirection: "row" }}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          <View
            {...pan_responder?.panHandlers}
            key={item?.id}
            style={styles.wishlist_item}
          >
            {handle_render_item(item, is_product_in_cart)}
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.delete_btn}
          onPress={() => handle_delete(item)}
        >
          <Text
            style={{
              fontSize: 18,
              color: "#fff",
              fontWeight: "700",
            }}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
        title={
          <Text style={{ fontSize: 20, fontWeight: "700" }}>Wishlist</Text>
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

      {wishlist_data?.length === 0 ? (
        <View style={styles.empty_wrap}>
          <View style={styles.empty_glow}>
            <View style={styles.empty_icon_circle}>
              <FontAwesome name="heart" size={40} color="#fff" />
            </View>
          </View>

          <Text style={styles.empty_title}>No favorites yet</Text>
          <Text style={styles.empty_subtitle}>
            Tap the heart on dishes you love and find them here later.
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
      ) : (
        <FlatList
          data={wishlist_data}
          renderItem={render_item}
          keyExtractor={(item) => `${item?.id?.toString()}${item?.name}`}
          contentContainerStyle={styles.wishlist_container}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  wishlist_container: {
    gap: 12,
    marginHorizontal: 20,
  },
  wishlist_item: {
    backgroundColor: "#f6f6f8",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  wishlist_name: {
    fontSize: 18,
    width: 150,
  },
  wishlist_price: {
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
