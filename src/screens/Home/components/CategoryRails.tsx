import React, { useEffect, useState } from "react";
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
} from "react-native";
import _, { map } from "lodash";
import product from "../../../../utils/api/product";
import { Skeleton } from "native-base";
import { useNavigation } from "@react-navigation/native";
import constants from "../../../../utils/constants";
import { useAppTheme } from "../../../hooks/useAppTheme";

const CategoryRail = () => {
  const { colors } = useAppTheme();
  const [category_data, set_category_data] = useState([]);
  const [loading, set_loading] = useState(true);
  const arr = Array.from({ length: 3 }, (v, i) => i);
  const navigate: any = useNavigation();


  const handle_get_categories = async () => {
    set_loading(true);
    try {
      const response = await product.get_categories();
      set_category_data(response?.data);
    } catch (err) {
      console.log(err);
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    handle_get_categories();
  }, []);

  if (loading) {
    return (
      <View style={{ flexDirection: "row", gap: 20 }}>
        {map(arr, (item) => (
          <Skeleton key={item} height={60} width={180} borderRadius={10} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={category_data}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigate.navigate(constants.route_names.CategoryDetails, { category_id: item?.id , name: item?.name })}
          style={[
            styles.categoryContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Image
            src={item.icon}
            style={item?.style ? item?.style : styles.categoryIcon}
          />
          <Text
            style={[styles.categoryText, { color: colors.text }]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.categoryRail}
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  categoryRail: {
    gap: 20,
  },
  activeCategoryContainer: {
    backgroundColor: "#ed7550",
  },
  activeCategoryText: {
    color: "white",
  },
  categoryContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 6,
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  categoryIcon: {
    width: 50,
    height: 50,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "700",
    paddingEnd: 10,
  },
});

export default CategoryRail;
