import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import ImageLinks from "../../../../assets/ImageLink";
import { SIZES } from "../../../../constants";
import { FontAwesome } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { debounce, find, map } from "lodash";
import product from "../../../../utils/api/product";
import { Skeleton } from "native-base";
import { update_wishlist } from "../../../../store/slices/WishlistSlice";
import {
  add_to_wishlist_action,
  remove_from_wishlist_action,
} from "../../../../actions/wishlist";
import { useNavigation } from "@react-navigation/native";
import constants from "../../../../utils/constants";
import { useAppTheme } from "../../../hooks/useAppTheme";

const PopularRails = () => {
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const wishlist_data = useSelector(
    (state: any) => state.wishlist.wishlist_data
  );
  const [popular_data, set_popular_data] = useState([]);
  const [loading, set_loading] = useState(true);
  const arr = Array.from({ length: 3 }, (v, i) => i);
  const navigate: any = useNavigation();

  const debounced_ref = useRef(
    debounce((product_id: string, exists: any, dispatch: any, data: any) => {
      if (exists) {
        dispatch(remove_from_wishlist_action(product_id, data));
      } else {
        dispatch(add_to_wishlist_action(product_id));
      }
    }, 2000)
  );

  const handle_favorite = (data: any) => {
    const product_id_exist = find(
      wishlist_data,
      (item: any) => item?.id === data?.id
    );
    dispatch(update_wishlist(data));
    debounced_ref.current(data?.id, product_id_exist, dispatch, data);
  };

  const handle_get_popular_rail = async () => {
    set_loading(true);
    try {
      const response = await product.get_popular_rails();
      set_popular_data(response?.data);
    } catch (err) {
      console.log(err);
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    handle_get_popular_rail();
  }, []);

  if (loading) {
    return (
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Skeleton height={4} width={180} borderRadius={10} />
          <Skeleton height={4} width={10} borderRadius={10} />
        </View>
        <View style={{ flexDirection: "row", gap: 20 }}>
          {map(arr, (item) => (
            <Skeleton key={item} height={300} width={180} borderRadius={10} />
          ))}
        </View>
      </View>
    );
  }

  const render_cards = (item: any) => {
    const is_favorite = find(
      wishlist_data,
      (wishlist: any) => wishlist?.id === item?.id
    );

    return (
      <TouchableOpacity
        style={[styles.card_container, { backgroundColor: colors.surface }]}
        onPress={() =>
          navigate.navigate(constants.route_names.ProductDetails, {
            id: item?.id,
          })
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image source={ImageLinks.calories} style={styles.icon_style} />
            <Text style={styles.calories}>{item?.calories} Calories</Text>
          </View>

          <TouchableOpacity onPress={() => handle_favorite(item)}>
            <FontAwesome
              name={is_favorite ? "heart" : "heart-o"}
              size={20}
              color={is_favorite ? "#ff6e4d" : "grey"}
            />
          </TouchableOpacity>
        </View>

        <Image
          src={item?.image}
          alt="img"
          style={item?.style ? item?.style : styles.card_image}
        />

        <View style={styles.card_content}>
          <Text style={[styles.card_title, { color: colors.text }]}>
            {item?.name}
          </Text>
          <Text
            style={[styles.card_description, { color: colors.textSecondary }]}
          >
            {item?.description}
          </Text>
          <Text style={[styles.card_price, { color: colors.text }]}>
            ${item?.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <React.Fragment>
      <View style={styles.title_container}>
        <Text
          style={{
            fontWeight: "700",
            fontSize: 18,
            color: colors.text,
          }}
        >
          Popular Near You
        </Text>
      </View>
      <FlatList
        data={popular_data}
        horizontal
        keyExtractor={(item: any) => item?.id}
        renderItem={({ item }) => render_cards(item)}
        contentContainerStyle={styles.popular_rail}
        showsHorizontalScrollIndicator={false}
      />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  title_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  popular_rail: {
    gap: 20,
  },
  card_container: {
    borderRadius: 20,
    padding: 20,
    maxWidth: 220,
    justifyContent: "space-between",
  },
  card_image: {
    width: "100%",
    height: 150,
    borderRadius: 15,
    resizeMode: "contain",
  },
  card_content: {
    alignItems: "center",
  },
  calories: {
    fontSize: 14,
    color: "grey",
  },
  card_title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
    textAlign: "center",
  },
  card_description: {
    fontSize: 14,
    marginBottom: 20,
    color: "#888",
    textAlign: "center",
    minHeight: 30,
  },
  card_price: {
    fontSize: 20,
    fontWeight: "900",
  },
  icon_style: {
    resizeMode: "contain",
    height: SIZES.height * 0.03,
    width: SIZES.width * 0.03,
    paddingHorizontal: 15,
  },
});

export default PopularRails;
