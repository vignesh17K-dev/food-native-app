import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome } from "@expo/vector-icons";
import { Skeleton } from "native-base";
import { debounce, find, map } from "lodash";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppToast } from "../../context/AppToast";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants";
import product from "../../../utils/api/product";
import constants from "../../../utils/constants";
import { RestaurantDetail } from "../../../types/restaurant";
import { RootStackParamList } from "../../routes";
import { useDispatch, useSelector } from "react-redux";
import { update_wishlist } from "../../../store/slices/WishlistSlice";
import {
  add_to_wishlist_action,
  remove_from_wishlist_action,
} from "../../../actions/wishlist";

type Props = NativeStackScreenProps<RootStackParamList, "restaurant">;

const Restaurant = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { colors, darkMode } = useAppTheme();
  const toast = useAppToast();
  const dispatch = useDispatch();
  const wishlist_data = useSelector(
    (state: any) => state?.wishlist?.wishlist_data
  );

  const [restaurant, set_restaurant] = useState<RestaurantDetail | null>(null);
  const [loading, set_loading] = useState(true);
  const [search, set_search] = useState("");

  const debounced_wishlist_ref = useRef(
    debounce((product_id: string, exists: any, dispatch: any, data: any) => {
      if (exists) {
        dispatch(remove_from_wishlist_action(product_id, data));
      } else {
        dispatch(add_to_wishlist_action(product_id));
      }
    }, 2000)
  );

  const handle_get_restaurant = async (restaurant_id: string) => {
    set_loading(true);
    try {
      const response = await product.get_restaurant(restaurant_id);
      set_restaurant(response?.data ?? null);
    } catch (error: any) {
      const message = error?.message ?? "Unable to load restaurant";
      toast.show({
        title: message,
        placement: "top",
      });
      if (error?.status === 404) {
        navigation.goBack();
      }
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    if (id) {
      handle_get_restaurant(id);
    }
  }, [id]);

  const filtered_menu = useMemo(() => {
    const menu = restaurant?.menu ?? [];
    const query = search.trim().toLowerCase();
    if (!query) {
      return menu;
    }
    return menu.filter((item: any) => {
      const name_match = item?.name?.toLowerCase?.().includes(query);
      const tags = Array.isArray(item?.tags) ? item.tags : [];
      const tag_match = tags.some((tag: string) =>
        String(tag).toLowerCase().includes(query)
      );
      return name_match || tag_match;
    });
  }, [restaurant?.menu, search]);

  const handle_favorite = (data: any) => {
    const product_id_exist = find(
      wishlist_data,
      (item: any) => item?.id === data?.id
    );
    dispatch(update_wishlist(data));
    debounced_wishlist_ref.current(data?.id, product_id_exist, dispatch, data);
  };

  const render_product = ({ item }: { item: any }) => {
    const is_favorite = find(
      wishlist_data,
      (wishlist: any) => wishlist?.id === item?.id
    );

    return (
      <TouchableOpacity
        style={[styles.card_container, { backgroundColor: colors.surface }]}
        onPress={() =>
          navigation.navigate(constants.route_names.ProductDetails, {
            id: item?.id,
          })
        }
      >
        <View style={styles.card_header}>
          <View style={styles.calories_row}>
            <Image source={ImageLinks.calories} style={styles.calories_icon} />
            <Text
              style={styles.calories}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.calories} Cal
            </Text>
          </View>

          <TouchableOpacity onPress={() => handle_favorite(item)}>
            <FontAwesome
              name={is_favorite ? "heart" : "heart-o"}
              size={16}
              color={is_favorite ? "#ff6e4d" : "grey"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.image_wrapper}>
          <Image
            source={{ uri: item?.image }}
            style={styles.card_image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card_content}>
          <Text
            style={[styles.card_title, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.name}
          </Text>
          <Text
            style={[styles.card_description, { color: colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.description}
          </Text>
          <Text
            style={[styles.card_price, { color: colors.text }]}
            numberOfLines={1}
          >
            ${item?.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedScreen style={styles.container} edges={["bottom"]}>
        <Skeleton height={SIZES.height * 0.28} width="100%" />
        <View style={styles.skeleton_body}>
          <Skeleton
            height={20}
            width={20}
            borderRadius={40}
            style={{ marginTop: -36 }}
          />
          <Skeleton height={5} width={180} borderRadius={8} mt={4} />
          <Skeleton height={4} width={120} borderRadius={8} mt={3} />
          <Skeleton height={12} width="100%" borderRadius={12} mt={5} />
          <View style={styles.skeleton_grid}>
            {map([0, 1, 2, 3], (item) => (
              <Skeleton
                key={item}
                height={220}
                width="48%"
                borderRadius={16}
              />
            ))}
          </View>
        </View>
      </ThemedScreen>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <ThemedScreen style={styles.container} edges={["bottom"]}>
      <FlatList
        data={filtered_menu}
        keyExtractor={(item) => item?.id?.toString()}
        numColumns={2}
        columnWrapperStyle={styles.column_wrapper}
        contentContainerStyle={styles.list_content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.hero_wrap}>
              <Image
                source={{ uri: restaurant.image }}
                style={styles.hero_image}
              />
              <TouchableOpacity
                style={[
                  styles.back_button,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={ImageLinks.back_arrow}
                  style={[styles.back_icon, { tintColor: colors.icon }]}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.logo_wrap,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Image
                  source={{ uri: restaurant.logo }}
                  style={styles.logo_image}
                />
              </View>
            </View>

            <View style={styles.info_section}>
              <Text style={[styles.restaurant_name, { color: colors.text }]}>
                {restaurant.name}
              </Text>
              <View style={styles.meta_row}>
                <View style={styles.rating_row}>
                  <FontAwesome name="star" size={14} color="#ed7550" />
                  <Text style={[styles.meta_text, { color: colors.text }]}>
                    {restaurant.rating?.toFixed?.(1) ?? restaurant.rating}
                  </Text>
                </View>
                <Text style={[styles.meta_dot, { color: colors.textSecondary }]}>
                  ·
                </Text>
                <Text
                  style={[styles.meta_text, { color: colors.textSecondary }]}
                >
                  {restaurant.deliveryTime}
                </Text>
              </View>

              <View
                style={[
                  styles.search_box,
                  {
                    backgroundColor: darkMode
                      ? colors.surfaceElevated
                      : colors.inputMuted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Image
                  source={ImageLinks.search}
                  style={[styles.search_icon, { tintColor: darkMode ? 'black' : colors.icon }]}
                />
                <TextInput
                  value={search}
                  onChangeText={set_search}
                  placeholder="Search menu..."
                  placeholderTextColor={colors.placeholder}
                  style={[styles.search_input, { color: colors.text }]}
                />
              </View>

              <Text
                style={[styles.menu_count, { color: colors.textSecondary }]}
              >
                {filtered_menu.length === 1
                  ? "1 item"
                  : `${filtered_menu.length} items`}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty_container}>
            <Text style={[styles.empty_text, { color: colors.textSecondary }]}>
              No menu items match your search
            </Text>
          </View>
        }
        renderItem={render_product}
      />
    </ThemedScreen>
  );
};

export default Restaurant;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero_wrap: {
    width: "100%",
    height: SIZES.height * 0.28,
    marginBottom: 44,
  },
  hero_image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  back_button: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  back_icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  logo_wrap: {
    position: "absolute",
    bottom: -36,
    left: 20,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logo_image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  info_section: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  restaurant_name: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  meta_row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  rating_row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meta_text: {
    fontSize: 14,
    fontWeight: "600",
  },
  meta_dot: {
    fontSize: 14,
  },
  search_box: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  search_icon: {
    width: 18,
    height: 18,
    marginRight: 8,
    resizeMode: "contain",
  },
  search_input: {
    flex: 1,
    fontSize: 15,
  },
  menu_count: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  list_content: {
    paddingBottom: 32,
  },
  column_wrapper: {
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  card_container: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    overflow: "hidden",
    minHeight: 260,
  },
  card_header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calories_row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 4,
    minWidth: 0,
  },
  calories_icon: {
    resizeMode: "contain",
    height: 12,
    width: 12,
    marginRight: 4,
  },
  calories: {
    fontSize: 10,
    color: "grey",
    flexShrink: 1,
  },
  image_wrapper: {
    width: "100%",
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 10,
  },
  card_image: {
    width: "100%",
    height: "100%",
  },
  card_content: {
    width: "100%",
    marginTop: 10,
    flex: 1,
    justifyContent: "flex-end",
  },
  card_title: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  card_description: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 14,
  },
  card_price: {
    fontSize: 14,
    fontWeight: "900",
  },
  empty_container: {
    paddingVertical: 48,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  empty_text: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  skeleton_body: {
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  skeleton_grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
    width: "100%",
    justifyContent: "space-between",
  },
});
