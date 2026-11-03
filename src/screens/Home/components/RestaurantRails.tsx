import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { map } from "lodash";
import { Skeleton } from "native-base";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import product from "../../../../utils/api/product";
import constants from "../../../../utils/constants";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { Restaurant } from "../../../../types/restaurant";
import { SIZES } from "../../../../constants";

const RestaurantRails = () => {
  const { colors } = useAppTheme();
  const navigate: any = useNavigation();
  const [restaurants, set_restaurants] = useState<Restaurant[]>([]);
  const [loading, set_loading] = useState(true);
  const skeleton_items = Array.from({ length: 3 }, (_, i) => i);

  const handle_get_restaurants = async () => {
    set_loading(true);
    try {
      const response = await product.get_restaurants();
      set_restaurants(response?.data ?? []);
    } catch (err) {
      console.log(err);
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    handle_get_restaurants();
  }, []);

  if (loading) {
    return (
      <View>
        <View style={styles.title_container}>
          <Skeleton height={4} width={180} borderRadius={10} />
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          {map(skeleton_items, (item) => (
            <Skeleton key={item} height={200} width={220} borderRadius={16} />
          ))}
        </View>
      </View>
    );
  }

  if (restaurants.length === 0) {
    return null;
  }

  const render_card = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={[styles.card_container, { backgroundColor: colors.surface }]}
      onPress={() =>
        navigate.navigate(constants.route_names.Restaurant, { id: item.id })
      }
      activeOpacity={0.85}
    >
      <Image src={item.image} style={styles.hero_image} />
      <View style={styles.card_content}>
        <Text
          style={[styles.card_title, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={styles.meta_row}>
          <Text
            style={[styles.meta_text, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.deliveryTime}
          </Text>
          <View style={styles.rating_row}>
            <FontAwesome name="star" size={12} color="#ed7550" />
            <Text style={[styles.rating_text, { color: colors.text }]}>
              {item.rating?.toFixed?.(1) ?? item.rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <React.Fragment>
      <View style={styles.title_container}>
        <Text style={[styles.section_title, { color: colors.text }]}>
          Restaurants Near You
        </Text>
      </View>
      <FlatList
        data={restaurants}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={render_card}
        contentContainerStyle={styles.rail}
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
  section_title: {
    fontWeight: "700",
    fontSize: 18,
  },
  rail: {
    gap: 16,
  },
  card_container: {
    width: SIZES.width * 0.58,
    borderRadius: 16,
    overflow: "hidden",
  },
  hero_image: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  card_content: {
    padding: 12,
    gap: 8,
  },
  card_title: {
    fontSize: 16,
    fontWeight: "700",
  },
  meta_row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  meta_text: {
    fontSize: 13,
    flex: 1,
  },
  rating_row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating_text: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default RestaurantRails;
