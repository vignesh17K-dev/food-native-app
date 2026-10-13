import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants/theme";
import { Skeleton } from "native-base";
import { useAppToast } from "../../context/AppToast";
import product from "../../../utils/api/product";
import { debounce, find, map } from "lodash";
import constants from "../../../utils/constants";
import { FontAwesome } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { update_wishlist } from "../../../store/slices/WishlistSlice";
import {
  add_to_wishlist_action,
  remove_from_wishlist_action,
} from "../../../actions/wishlist";

const CategoryDetails = ({ route, navigation }) => {
  const { category_id, name } = route.params;
  const [products, set_products] = useState<any[]>([]);
  const [loading, set_loading] = useState<boolean>(false);
  const toast = useAppToast();
  const dispatch = useDispatch();
  const wishlist_data = useSelector(
    (state: any) => state?.wishlist?.wishlist_data,
  );

  const debounced_wishlist_ref = useRef(
    debounce((product_id: string, exists: any, dispatch: any, data: any) => {
      if (exists) {
        dispatch(remove_from_wishlist_action(product_id, data));
      } else {
        dispatch(add_to_wishlist_action(product_id));
      }
    }, 2000),
  );

  const handle_get_category_details = async (id: string) => {
    set_loading(true);
    try {
      const response = await product.get_category_details(id);
      const list = response?.data?.products ?? response?.data ?? [];
      set_products(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.show({
        title: error?.message ?? "Unable to load category products",
        placement: "top",
      });
      set_products([]);
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    if (category_id) {
      handle_get_category_details(category_id);
    }
  }, [category_id]);

  const handle_favorite = (data: any) => {
    const product_id_exist = find(
      wishlist_data,
      (item: any) => item?.id === data?.id,
    );
    dispatch(update_wishlist(data));
    debounced_wishlist_ref.current(data?.id, product_id_exist, dispatch, data);
  };

  const handle_render_skeleton = () => {
    return (
      <View style={styles.skeleton_container}>
        {map(
          Array.from({ length: 3 }, (_, index) => index),
          (item) => (
            <View key={item} style={styles.skeleton_item}>
              <Skeleton height={250} width={"50%"} borderRadius={10} />
              <Skeleton height={250} width={"50%"} borderRadius={10} />
            </View>
          ),
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
        style={styles.card_container}
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
            style={styles.card_title}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.name}
          </Text>
          <Text
            style={styles.card_description}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.description}
          </Text>
          <Text style={styles.card_price} numberOfLines={1}>
            ${item?.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const result_label =
    products.length === 1 ? "1 product" : `${products.length} products`;

  const handle_render_product_count = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.count_container}>
        <Text style={styles.results_count}>{result_label}</Text>
      </View>
    );
  };

  const handle_render_content = () => {
    if (products.length === 0) {
      return (
        <View style={styles.empty_container}>
          <Image
            source={ImageLinks.empty_wishlist}
            style={styles.empty_image}
            resizeMode="contain"
          />
          <Text style={styles.empty_text}>No products in this category</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        renderItem={render_product}
        keyExtractor={(item) => item?.id?.toString()}
        numColumns={2}
        columnWrapperStyle={styles.column_wrapper}
        contentContainerStyle={styles.list_content}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const handle_render_header = () => {
    return (
      <Header
        left_section={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={() => navigation?.goBack()}>
              <Image
                source={ImageLinks.back_arrow}
                style={styles.back_icon}
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>{name}</Text>
          </View>
        }
        container_style={{
          marginVertical: 10,
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {handle_render_header()}
      {handle_render_product_count()}
      {loading ? handle_render_skeleton() : handle_render_content()}
    </SafeAreaView>
  );
};

export default CategoryDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  back_icon: {
    resizeMode: "contain",
    height: SIZES.height * 0.04,
    width: SIZES.height * 0.04,
  },
  skeleton_container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    paddingHorizontal: 35,
    rowGap: 20,
  },
  skeleton_item: {
    flexDirection: "row",
    gap: 15,
  },
  count_container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  results_count: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  list_content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  column_wrapper: {
    gap: 12,
    marginBottom: 12,
  },
  card_container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
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
    color: "#000",
  },
  card_description: {
    fontSize: 11,
    marginBottom: 8,
    color: "#888",
    lineHeight: 14,
  },
  card_price: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000",
  },
  empty_container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  empty_image: {
    width: SIZES.width * 0.5,
    height: SIZES.height * 0.2,
    marginBottom: 20,
  },
  empty_text: {
    fontSize: 16,
    color: "#888",
    fontWeight: "600",
    textAlign: "center",
  },
});
