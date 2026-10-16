import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  TextInput,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import product from "../../../utils/api/product";
import {
  buildProductSearchBody,
  hasActiveFilters,
  ProductPagination,
  PRODUCT_PAGE_LIMIT,
} from "../../../utils/api/buildProductFilterParams";
import constants from "../../../utils/constants";
import { FontAwesome } from "@expo/vector-icons";
import { debounce, find } from "lodash";
import { update_wishlist } from "../../../store/slices/WishlistSlice";
import {
  add_to_wishlist_action,
  remove_from_wishlist_action,
} from "../../../actions/wishlist";
import FilterModal, {
  DEFAULT_FILTER_VALUES,
  FilterValues,
} from "../Home/components/FilterModal";
import {
  clear_product_filters,
  set_product_filters,
} from "../../../store/slices/SearchSlice";

const TAB_BAR_HEIGHT = SIZES.height * 0.1;
const SEARCH_DEBOUNCE_MS = 1000;

const Search = () => {
  const { colors } = useAppTheme();
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const list_bottom_padding = TAB_BAR_HEIGHT + insets.bottom + 16;
  const product_filters = useSelector(
    (state: any) => state?.search?.product_filters,
  );
  const filters_active = hasActiveFilters(product_filters);
  const wishlist_data = useSelector(
    (state: any) => state?.wishlist?.wishlist_data,
  );

  const [search_value, set_search_value] = useState("");
  const [products, set_products] = useState<any[]>([]);
  const [loading, set_loading] = useState(true);
  const [loading_more, set_loading_more] = useState(false);
  const [error, set_error] = useState("");
  const [filter_visible, set_filter_visible] = useState(false);
  const [pagination, set_pagination] = useState<
    Pick<ProductPagination, "page" | "total" | "has_next">
  >({
    page: 1,
    total: 0,
    has_next: false,
  });

  const debounced_wishlist_ref = useRef(
    debounce((product_id: string, exists: any, dispatch: any, data: any) => {
      if (exists) {
        dispatch(remove_from_wishlist_action(product_id, data));
      } else {
        dispatch(add_to_wishlist_action(product_id));
      }
    }, 1000),
  );

  const product_filters_ref = useRef(product_filters);
  product_filters_ref.current = product_filters;

  const search_value_ref = useRef(search_value);
  search_value_ref.current = search_value;

  const load_products = useCallback(
    async (overrides?: {
      search?: string;
      filters?: FilterValues | null;
      page?: number;
      append?: boolean;
    }) => {
      const is_append = overrides?.append ?? false;
      const next_page = overrides?.page ?? 1;

      if (is_append) {
        set_loading_more(true);
      } else {
        set_loading(true);
        set_error("");
      }

      try {
        const body = buildProductSearchBody({
          search: overrides?.search ?? search_value_ref.current,
          filters:
            overrides?.filters !== undefined
              ? overrides.filters
              : product_filters_ref.current,
          page: next_page,
          limit: PRODUCT_PAGE_LIMIT,
        });
        const response = await product.get_products(body);
        const list =
          response?.data ??
          response?.products ??
          response?.data?.products ??
          [];
        const next_list = Array.isArray(list) ? list : [];
        const pagination_info = response?.pagination;

        set_products((prev) =>
          is_append ? [...prev, ...next_list] : next_list,
        );
        set_pagination({
          page: pagination_info?.page ?? next_page,
          total: pagination_info?.total ?? next_list.length,
          has_next: pagination_info?.has_next ?? false,
        });
      } catch (err) {
        console.error(err);
        if (!is_append) {
          set_error("Unable to load products. Please try again.");
          set_products([]);
          set_pagination({ page: 1, total: 0, has_next: false });
        }
      } finally {
        set_loading(false);
        set_loading_more(false);
      }
    },
    [],
  );

  const load_products_ref = useRef(load_products);
  load_products_ref.current = load_products;

  const debounced_search_ref = useRef(
    debounce((search: string) => {
      load_products_ref.current({ search, page: 1 });
    }, SEARCH_DEBOUNCE_MS),
  );

  const handle_load_more = () => {
    if (loading || loading_more || !pagination.has_next) {
      return;
    }

    load_products({ page: pagination.page + 1, append: true });
  };

  useFocusEffect(
    useCallback(() => {
      load_products_ref.current();
    }, []),
  );

  useEffect(() => {
    return () => debounced_search_ref.current.cancel();
  }, []);

  const handle_search_change = (text: string) => {
    set_search_value(text);
    debounced_search_ref.current(text);
  };

  const handle_favorite = (data: any) => {
    const product_id_exist = find(
      wishlist_data,
      (item: any) => item?.id === data?.id,
    );
    dispatch(update_wishlist(data));
    debounced_wishlist_ref.current(data?.id, product_id_exist, dispatch, data);
  };

  const handle_open_filter = () => {
    set_filter_visible(true);
  };

  const handle_close_filter = () => {
    set_filter_visible(false);
  };

  const handle_apply_filters = (filters: FilterValues) => {
    set_filter_visible(false);

    if (hasActiveFilters(filters)) {
      dispatch(set_product_filters(filters));
      load_products({ filters, page: 1 });
      return;
    }

    dispatch(clear_product_filters());
    load_products({ filters: null, page: 1 });
  };

  const handle_clear_filters = () => {
    dispatch(clear_product_filters());
    load_products({ filters: null, page: 1 });
  };

  const handle_render_search = () => {
    return (
      <View
        style={[
          styles.search_container,
          { backgroundColor: colors.searchBackground },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate(constants.route_names.Home)}
        >
          <Image
            source={ImageLinks?.back_arrow}
            style={styles.back_icon}
            alt="back"
          />
        </TouchableOpacity>
        <TextInput
          onChangeText={handle_search_change}
          value={search_value}
          placeholder="Search food..."
          keyboardType="default"
          style={[styles.search_input, { color: colors.text }]}
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity onPress={handle_open_filter}>
          <View
            style={[
              styles.filter_button,
              filters_active && styles.filter_button_active,
            ]}
          >
            <Image
              source={ImageLinks.filter}
              alt="filter"
              style={[
                styles.filter_icon,
                { tintColor: filters_active ? "#fff" : colors.icon },
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const handle_render_section_header = () => {
    const show_count = !loading || products.length > 0;
    const total_results = pagination.total || products.length;
    const result_label =
      total_results === 1 ? "1 result" : `${total_results} results`;

    return (
      <View style={styles.section_header_wrap}>
        <View style={styles.section_header}>
          <Text style={[styles.section_title, { color: colors.text }]}>
            {filters_active ? "Filtered Results" : "All Products"}
          </Text>
          {filters_active && (
            <TouchableOpacity onPress={handle_clear_filters}>
              <Text style={styles.clear_filters_text}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
        {show_count && (
          <Text style={[styles.results_count, { color: colors.textSecondary }]}>
            {result_label}
          </Text>
        )}
      </View>
    );
  };

  const render_product = ({ item }: { item: any }) => {
    const is_favorite = find(
      wishlist_data,
      (wishlist: any) => wishlist?.id === item?.id,
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
          <Image src={item?.image} alt="product" style={styles.card_image} />
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
          <Text style={[styles.card_price, { color: colors.text }]} numberOfLines={1}>
            ${item?.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const render_content = () => {
    if (loading && products.length === 0) {
      return (
        <View style={styles.center_content}>
          <ActivityIndicator size="large" color="#ed7550" />
        </View>
      );
    }

    if (error && products.length === 0) {
      return (
        <View style={styles.center_content}>
          <Text style={styles.error_text}>{error}</Text>
          <TouchableOpacity onPress={() => load_products()}>
            <Text style={styles.retry_text}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!loading && products.length === 0) {
      return (
        <View style={styles.center_content}>
          <View
            style={[
              styles.empty_icon_wrap,
              { backgroundColor: colors.accentSoft },
            ]}
          >
            <FontAwesome name="search" size={48} color="#ed7550" />
          </View>
          <Text style={[styles.empty_text, { color: colors.text }]}>
            No products found
          </Text>
          <Text style={[styles.empty_subtext, { color: colors.textSecondary }]}>
            Try a different search or adjust your filters
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        style={styles.list}
        data={products}
        renderItem={render_product}
        keyExtractor={(item) => item?.id?.toString()}
        numColumns={2}
        columnWrapperStyle={styles.column_wrapper}
        contentContainerStyle={[
          styles.list_content,
          { paddingBottom: list_bottom_padding },
        ]}
        ListHeaderComponent={
          loading && products.length > 0 ? (
            <View style={styles.list_loading}>
              <ActivityIndicator size="small" color="#ed7550" />
            </View>
          ) : null
        }
        ListFooterComponent={
          loading_more ? (
            <View style={styles.list_loading}>
              <ActivityIndicator size="small" color="#ed7550" />
            </View>
          ) : null
        }
        onEndReached={handle_load_more}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <ThemedScreen style={styles.screen} edges={["top"]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {handle_render_search()}
        {handle_render_section_header()}
        {render_content()}
      </View>
      <FilterModal
        visible={filter_visible}
        onClose={handle_close_filter}
        onApply={handle_apply_filters}
        initialFilters={product_filters ?? DEFAULT_FILTER_VALUES}
      />
    </ThemedScreen>
  );
};

export default Search;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    minHeight: SIZES.height * 0.88,
    marginHorizontal: 20,
    marginBottom: 0,
    paddingTop: 8,
  },
  search_container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.height * 0.012,
    paddingHorizontal: 12,
    borderRadius: 16,
    width: "100%",
    gap: 12,
  },
  back_icon: {
    resizeMode: "contain",
    height: SIZES.height * 0.028,
    width: SIZES.height * 0.028,
  },
  search_input: {
    flex: 1,
    fontSize: 16,
  },
  filter_button: {
    padding: 8,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 10,
  },
  filter_button_active: {
    backgroundColor: "#ed7550",
    borderColor: "#ed7550",
  },
  section_header_wrap: {
    marginTop: 20,
    marginBottom: 15,
  },
  section_header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section_title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  results_count: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  clear_filters_text: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ed7550",
  },
  list_content: {
    flexGrow: 1,
  },
  list: {
    flex: 1,
  },
  list_loading: {
    alignItems: "center",
    paddingBottom: 12,
  },
  column_wrapper: {
    gap: 12,
    marginBottom: 12,
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
    resizeMode: "contain",
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
  filter_icon: {
    height: 22,
    width: 22,
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
  center_content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 0,
  },
  empty_text: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  empty_subtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  empty_icon_wrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  error_text: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 12,
  },
  retry_text: {
    fontSize: 16,
    color: "#ed7550",
    fontWeight: "700",
  },
});
