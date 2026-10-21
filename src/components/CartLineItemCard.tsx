import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SIZES } from "../../constants";
import { calculateLineTotal } from "../../utils/cart/cartTotals";
import type { CartLineItem } from "../../utils/cart/flattenCartProducts";
import { useAppTheme } from "../hooks/useAppTheme";
import Counter from "./Counter";

type Props = {
  item: CartLineItem;
  /** When false, hides quantity controls and swipe-to-delete. */
  editable?: boolean;
  onPress?: () => void;
  onQuantityChange?: (count: number) => void;
  onDelete?: () => void;
  deleteLoading?: boolean;
  quantityDisabled?: boolean;
};

function CartLineItemCard({
  item,
  editable = true,
  onPress,
  onQuantityChange,
  onDelete,
  deleteLoading = false,
  quantityDisabled = false,
}: Props) {
  const { colors } = useAppTheme();
  const line_total = calculateLineTotal(item);
  const quantity = item?.quantity ?? 1;
  const translateX = useRef(new Animated.Value(0)).current;

  const pan_responder = useRef(
    PanResponder.create({
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
    }),
  ).current;

  const content = (
    <View style={styles.item_row}>
      <Image
        source={
          typeof item?.image === "string" ? { uri: item.image } : undefined
        }
        style={styles.item_image}
      />

      <View style={styles.item_info}>
        <Text
          style={[styles.cart_name, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item?.name}
        </Text>
        {!!item?.selectedSize && (
          <Text style={[styles.item_meta, { color: colors.textSecondary }]}>
            Size: {item.selectedSize}
          </Text>
        )}
        <Text style={styles.cart_price}>${line_total.toFixed(2)}</Text>
      </View>
    </View>
  );

  const main = onPress ? (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.cart_item_main}
      onPress={onPress}
    >
      {content}
    </TouchableOpacity>
  ) : (
    <View style={styles.cart_item_main}>{content}</View>
  );

  if (!editable) {
    return (
      <View style={[styles.cart_item, { backgroundColor: colors.surface }]}>
        {main}
        <Text style={[styles.qty_read_only, { color: colors.textSecondary }]}>
          Qty {quantity}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.swipe_row}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <View
          {...pan_responder.panHandlers}
          style={[styles.cart_item, { backgroundColor: colors.surface }]}
        >
          {main}
          <Counter
            minCount={0}
            disable_increment={quantityDisabled}
            disable_decrement={quantityDisabled}
            from_cart
            value={quantity}
            onChange={onQuantityChange}
          />
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.delete_btn}
        onPress={onDelete}
        disabled={deleteLoading}
      >
        {deleteLoading ? (
          <ActivityIndicator size="small" color={colors.icon} />
        ) : (
          <Text style={styles.delete_text}>Delete</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default CartLineItemCard;

const styles = StyleSheet.create({
  swipe_row: {
    flexDirection: "row",
  },
  cart_item: {
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
    flex: 1,
    minWidth: 0,
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
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 4,
  },
  cart_name: {
    fontSize: 18,
    flexShrink: 1,
  },
  item_meta: {
    fontSize: 13,
  },
  cart_price: {
    color: "#ed7550",
    fontSize: 16,
    fontWeight: "700",
  },
  qty_read_only: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 8,
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
});
