import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import CategoryRail from "./components/CategoryRails";
import PopularRails from "./components/PopularRails";
import RecommendedRails from "./components/RecommendedRails";
import _ from "lodash";
import constants from "../../../utils/constants";
import MenuRails from "./components/MenuRails";
import { useAppToast } from "../../context/AppToast";
import { set_section_data } from "../../../store/slices/HomeSlice";
import mock_data from "../../../constants/dummyData";
import wishlist from "../../../utils/api/wishlist";
import { set_wishlist } from "../../../store/slices/WishlistSlice";
import FilterModal, { FilterValues } from "./components/FilterModal";
import {
  clear_product_filters,
  set_product_filters,
} from "../../../store/slices/SearchSlice";
import CartIcon from "../../components/CartIcon";
import { useAppTheme } from "../../hooks/useAppTheme";

const Home = ({ navigation }: any) => {
  const { colors } = useAppTheme();
  const section_data = useSelector((state: any) => state?.home?.section_data);
  const navigate: any = useNavigation();
  const dispatch = useDispatch();
  const toast = useAppToast();
  const [filter_visible, set_filter_visible] = useState(false);

  const scrollY = useRef(new Animated.Value(0))?.current;
  const translateHeader = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -80],
    extrapolate: "clamp",
  });
  const opacityTitle = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const translateTitle = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 30],
    extrapolate: "clamp",
  });


  const handle_render_header = () => {
    return (
      <Animated.View
        style={[
          { opacity: opacityTitle },
          ,
          { transform: [{ translateY: translateTitle }] },
        ]}
      >
        <Header
          title={
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
              HOME
            </Text>
          }
          right_section={<CartIcon />}
          left_section={
            <TouchableOpacity >
              <Image
                source={ImageLinks.profile}
                alt="search"
                style={{ height: 45, width: 45, borderRadius: 10 }}
              />
            </TouchableOpacity>
          }
          container_style={{
            marginVertical: 10,
          }}
        />
      </Animated.View>
    );
  };

  // const handle_open_filter = () => {
  //   set_filter_visible(true);
  // };

  const handle_close_filter = () => {
    set_filter_visible(false);
  };

  const handle_apply_filters = (filters: FilterValues) => {
    dispatch(set_product_filters(filters));
    set_filter_visible(false);
    navigate.navigate(constants.route_names.Search);
  };

  const handle_click = () => {
    dispatch(clear_product_filters());
    navigate.navigate(constants.route_names.Search);
  };

  const handle_render_search = () => {
    return (
      <View
        style={[styles.search_container, { backgroundColor: colors.searchBackground }]}
      >
        <TouchableOpacity
          style={styles.search_input_area}
          onPress={handle_click}
        >
          <Image
            source={ImageLinks.search}
            alt="search"
            style={{ height: 25, width: 25, tintColor: colors.icon }}
          />
          <Text style={[styles.placeholder_text, { color: colors.placeholder }]}>
            {"search food..."}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handle_render_deliver_section = () => {
    return (
      <View style={styles.deliver_to_section}>
        <Text style={styles.deliver_text}>DELIVERY TO</Text>
        <View style={{ flexDirection: "row" }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.deliver_address, { color: colors.text }]}
          >
            {mock_data?.my_profile?.address}
          </Text>
          <Image source={ImageLinks?.down_arrow} style={styles.icon_style} />
        </View>
      </View>
    );
  };

  const render_section = ({ item }: any) => {
    switch (item.section) {
      case "delivery":
        return handle_render_deliver_section();
      case "category":
        return <CategoryRail />;
      case "popular":
        return <PopularRails />;
      case "recommended":
        return <RecommendedRails />;
      case "menu":
        return <MenuRails />;
      default:
        return null;
    }
  };

  const handle_get_wishlist = async () => {
    try {
      const response = await wishlist.get_wishlist_data();
      dispatch(set_wishlist(response?.data?.products ?? []));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handle_get_wishlist();
    dispatch(set_section_data(constants.sections));
  }, []);

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: translateHeader }], backgroundColor: colors.background },
        ]}
      >
        {handle_render_header()}
        {handle_render_search()}
      </Animated.View>
      <Animated.FlatList
        data={section_data}
        renderItem={render_section}
        keyExtractor={(item) => item?.section}
        contentContainerStyle={[styles?.content, { backgroundColor: colors.background }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={1}
      />
      <FilterModal
        visible={filter_visible}
        onClose={handle_close_filter}
        onApply={handle_apply_filters}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 215,
    gap: 20,
    paddingBottom: 24,
  },
  header: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    height: 200,
    alignItems: "stretch",
    justifyContent: "flex-end",
  },
  search_container: {
    padding: SIZES.height * 0.015,
    borderRadius: 16,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  search_input_area: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filter_icon: {
    height: 22,
    width: 22,
  },
  placeholder_text: {
    fontSize: 18,
    fontWeight: "500",
  },
  deliver_to_section: {
    gap: 10,
  },
  deliver_text: {
    color: "#ed7550",
    fontSize: 18,
  },
  deliver_address: {
    fontSize: 18,
    fontWeight: "700",
    maxWidth: 300,
  },
  icon_style: {
    resizeMode: "contain",
    height: SIZES.height * 0.02,
    width: SIZES.width * 0.02,
    paddingHorizontal: 15,
  },
});
