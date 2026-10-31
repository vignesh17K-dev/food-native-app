import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "../hooks/useAppTheme";
import constants from "../../utils/constants";
import { ACCENT } from "../../utils/theme/appTheme";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import {
  removeOrderDeliveryStatus,
  type OrderStatusEvent,
} from "../../store/slices/OrderStatusSlice";

const BANNER_WIDTH = Dimensions.get("window").width;

const STATUS_ICONS: Record<string, string> = {
  confirmed: "clipboard-check-outline",
  prepared: "food",
  out_for_delivery: "moped",
  delivered: "check-circle-outline",
};

type OrderStatusBannerRowProps = {
  order: OrderStatusEvent;
  on_dismiss?: (order_id: string) => void;
};

const InProgressIcon = ({ icon_name }: { icon_name: string }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const animated_style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[styles.icon_wrap, { backgroundColor: ACCENT }, animated_style]}>
      <MaterialCommunityIcons name={icon_name} size={18} color="#fff" />
    </Animated.View>
  );
};

const OrderStatusBannerRow = ({
  order,
  on_dismiss,
}: OrderStatusBannerRowProps) => {
  const { colors, darkMode } = useAppTheme();
  const navigation: any = useNavigation();
  const is_delivered = order.order_status === "delivered";
  const is_in_progress = !is_delivered;

  const status_meta =
    constants.order_statuses.find((item) => item.key === order.order_status) ??
    null;

  const title = status_meta?.title ?? "Order update";
  const subtitle = status_meta?.description ?? "Tap to track delivery";
  const icon_name =
    STATUS_ICONS[order.order_status] ?? "package-variant-closed";

  const handle_press = () => {
    const params = { order_id: order.order_id };
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate(constants.route_names.DeliveryStatus, params);
      return;
    }
    navigation.navigate(constants.route_names.DeliveryStatus, params);
  };

  return (
    <View
      style={[
        styles.banner,
        {
          width: BANNER_WIDTH,
          backgroundColor: darkMode ? colors.accentSoft : "#fff3ee",
          borderTopColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handle_press}
        style={styles.banner_pressable}
      >
        {is_in_progress ? (
          <InProgressIcon icon_name={icon_name} />
        ) : (
          <View style={[styles.icon_wrap, { backgroundColor: ACCENT }]}>
            <MaterialCommunityIcons name={icon_name} size={18} color="#fff" />
          </View>
        )}
        <View style={styles.text_wrap}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
        {!is_delivered ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.textSecondary}
          />
        ) : null}
      </TouchableOpacity>
      {is_delivered ? (
        <TouchableOpacity
          hitSlop={10}
          onPress={() => on_dismiss?.(order.order_id)}
          accessibilityLabel="Dismiss delivered order banner"
          style={styles.dismiss_btn}
        >
          <MaterialCommunityIcons
            name="close"
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const OrderStatusBanner = () => {
  const dispatch = useDispatch();
  const { colors, darkMode } = useAppTheme();

  const statusesByOrderId = useAppSelector(
    (state: RootState) => state.orderStatus.statusesByOrderId,
  );
  const [active_index, set_active_index] = useState(0);
  const viewability_config = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  const visible_orders = useMemo(
    () => Object.values(statusesByOrderId),
    [statusesByOrderId],
  );

  const handle_dismiss = (order_id: string) => {
    dispatch(removeOrderDeliveryStatus(order_id));
  };

  const on_viewable_items_changed = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (typeof index === "number") {
        set_active_index(index);
      }
    },
  ).current;

  if (visible_orders.length === 0) {
    return null;
  }

  return (
    <View style={{
      backgroundColor: darkMode ? colors.accentSoft : "#fff3ee",
    }}>
      <FlatList
        data={visible_orders}
        keyExtractor={(item) => item.order_id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces={false}
        renderItem={({ item }) => (
          <OrderStatusBannerRow order={item} on_dismiss={handle_dismiss} />
        )}
        onViewableItemsChanged={on_viewable_items_changed}
        viewabilityConfig={viewability_config}
        onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / BANNER_WIDTH,
          );
          set_active_index(index);
        }}
      />
      {visible_orders.length > 1 ? (
        <View style={styles.dots}>
          {visible_orders.map((order, index) => (
            <View
              key={order.order_id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === active_index ? ACCENT : colors.border,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default OrderStatusBanner;

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  banner_pressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dismiss_btn: {
    padding: 4,
  },
  icon_wrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  text_wrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
