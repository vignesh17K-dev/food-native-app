import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import ImageLinks from "../../../../assets/ImageLink";
import { SIZES } from "../../../../constants";
import { FontAwesome } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import product from "../../../../utils/api/product";
import { debounce, find, map } from "lodash";
import { Skeleton } from "native-base";
import { update_wishlist } from "../../../../store/slices/WishlistSlice";
import {
  add_to_wishlist_action,
  remove_from_wishlist_action,
} from "../../../../actions/wishlist";
import constants from "../../../../utils/constants";
import { useNavigation } from "@react-navigation/native";

const MenuRails = () => {
  const [selected_menu, set_selected_menu] = useState<any>("");
  const [menu_data, set_menu_data] = useState([]);
  const [loading, set_loading] = useState(true);
  const wishlist_data = useSelector(
    (state: any) => state?.wishlist?.wishlist_data,
  );
  const arr = Array.from({ length: 6 }, (v, i) => i);
  const dispatch = useDispatch();
  const navigate: any = useNavigation();

  const render_menu_tabs = ({ item }: any) => {
    return (
      <TouchableOpacity onPress={() => set_selected_menu(item)}>
        <Text
          style={{
            color: item.id === selected_menu?.id ? "#FF6D00" : "#000",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
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

  const handle_get_menu_rail = async () => {
    set_loading(true);
    try {
      const response = await product.get_menu_rails();
      set_selected_menu(response?.data[0]);
      set_menu_data(response?.data);
    } catch (err) {
      console.log(err);
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    handle_get_menu_rail();
  }, []);

  if (loading) {
    return (
      <View>
        <View style={{ flexDirection: "row", gap: 20, marginBottom: 20 }}>
          {map(arr, (item) => (
            <Skeleton key={item} height={4} width={20} borderRadius={10} />
          ))}
        </View>
        <View style={{ gap: 20 }}>
          {map(arr, (item) => (
            <Skeleton
              key={item}
              height={300}
              width={"100%"}
              borderRadius={10}
            />
          ))}
        </View>
      </View>
    );
  }

  const render_cards = ({ item }: any) => {
    const is_favorite = find(
      wishlist_data,
      (wishlist: any) => wishlist?.id === item?.id,
    );

    return (
      <TouchableOpacity
        style={styles.card_container}
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
          <Text style={styles.card_title}>{item?.name}</Text>
          <Text style={styles.card_description}>{item?.description}</Text>
          <Text style={styles.card_price}>${item?.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={menu_data}
        renderItem={render_menu_tabs}
        keyExtractor={(item: any) => item?.id?.toString()}
        contentContainerStyle={styles.menu_list}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
      />

      <FlatList
        data={selected_menu?.list}
        renderItem={render_cards}
        keyExtractor={(item) => item?.id?.toString()}
        contentContainerStyle={styles.popular_rail}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menu_list: {
    gap: 24,
    marginBottom: 25,
  },
  popular_rail: {
    gap: 20,
  },
  card_container: {
    backgroundColor: "#f7f8fa",
    borderRadius: 20,
    padding: 20,
    minWidth: 220,
    marginBottom: 20,
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
  },
  card_description: {
    fontSize: 14,
    marginBottom: 20,
    color: "#888",
    textAlign: "center",
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

export default MenuRails;
