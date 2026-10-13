import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import ImageLinks from "../../assets/ImageLink";
import { Badge } from "native-base";
import { useSelector } from "react-redux";
import { NavigationProp, useNavigation } from "@react-navigation/native";

type CartIconParamList = {
  cart: undefined;
};

const CartIcon = () => {
  const navigation = useNavigation<NavigationProp<CartIconParamList>>();

  const cart_products =
    useSelector((state: any) => state?.cart?.cart_data?.products) ?? {};

  const count = Array.isArray(cart_products)
    ? cart_products.length
    : Object.values(cart_products).reduce((total: number, variants: any) => {
        if (!variants || typeof variants !== "object") {
          return total;
        }
        return total + Object.keys(variants).length;
      }, 0);

  return (
    <TouchableOpacity
      style={styles.cart_icon}
      onPress={() => navigation.navigate("cart")}
      activeOpacity={0.8}
    >
      <Image source={ImageLinks.cart} alt="cart" style={styles.cart_image} />
      {count > 0 && (
        <View style={styles.badge_wrap} pointerEvents="none">
          <Badge
            bg="red.400"
            colorScheme="danger"
            rounded="full"
            variant="solid"
            _text={{
              fontSize: 10,
              fontWeight: "700",
            }}
          >
            {count > 99 ? "99+" : count}
          </Badge>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CartIcon;

const styles = StyleSheet.create({
  cart_icon: {
    backgroundColor: "#ffdfd6",
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cart_image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    tintColor: "black",
  },
  badge_wrap: {
    position: "absolute",
    top: -4,
    right: -4,
  },
});
