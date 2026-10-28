import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  SafeAreaView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import constants from "../../utils/constants";
import { find, head, isEmpty, map } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { SIZES } from "../../constants";
import Home from "../screens/Home/Home";
import Search from "../screens/Search/Search";
import Cart from "../screens/Cart/Cart";
import Settings from "../screens/Settings/Settings";
import Wishlist from "../screens/Wishlist/Wishlist";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useAppTheme } from "../hooks/useAppTheme";
import OrderStatusBanner from "./OrderStatusBanner";

const Tab = createBottomTabNavigator();

const TabView = () => {
  const { colors, darkMode } = useAppTheme();
  const tab_navigation_state: any = useNavigationState((state) => state);
  const navigation: any = useNavigation();
  const [active_tab, set_active_tab] = useState<any>(
    head(constants.bottom_tabs),
  );
  const animated_value = useRef(new Animated.Value(0))?.current;

  useEffect(() => {
    Animated.timing(animated_value, {
      toValue: active_tab?.id,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [active_tab?.id]);

  useEffect(() => {
    const active_route =
      tab_navigation_state?.routes[tab_navigation_state?.index]?.state
        ?.routes?.[
      tab_navigation_state?.routes[tab_navigation_state?.index]?.state?.index
      ];
    const new_active_tab = find(constants.bottom_tabs, {
      route: active_route?.name,
    });
    if (!isEmpty(new_active_tab)) {
      set_active_tab(new_active_tab);
    }
  }, [tab_navigation_state]);

  const handle_navigate = (tab: any) => {
    navigation.navigate(tab.route);
    set_active_tab(tab);
  };

  const handle_render_tabs = (tab: any, index: number) => {
    const is_active = active_tab?.id === tab?.id;

    const scale = animated_value.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [1, 1.1, 1],
      extrapolate: "clamp",
    });
    const backgroundColor = is_active ? "rgb(237,117,80)" : "transparent";

    return (
      <TouchableOpacity onPress={() => handle_navigate(tab)} key={tab?.id}>
        <Animated.View
          style={[
            is_active ? styles?.active_tab_item : styles?.tab_item,
            {
              backgroundColor,
              transform: [{ scale }],
            },
          ]}
        >
          <Image
            source={tab?.icon}
            style={{
              ...styles.icon_style,
              tintColor: is_active
                ? "white"
                : darkMode
                  ? colors.textSecondary
                  : "grey",
            }}
          />
          {is_active && <Text style={styles.text_style}>{tab?.label}</Text>}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (active_tab?.route === constants.route_names.Cart) {
    return;
  }

  return (
    <SafeAreaView style={{
      backgroundColor: colors.surface, borderRadius: 28, shadowRadius: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      shadowOpacity: 0.1,
      elevation: 5,
    }}>
      <OrderStatusBanner />
      <View
        style={[
          styles.tab_container,
          {
            backgroundColor: colors.surface,
            borderTopColor: darkMode ? "rgba(255,255,255,0.12)" : colors.border,
          },
        ]}
      >
        {map(constants.bottom_tabs, (tab, index) => {
          return (
            <React.Fragment key={tab?.id}>
              {handle_render_tabs(tab, index)}
            </React.Fragment>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const TabBar = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={constants.route_names.Home}
      tabBar={() => <TabView />}
    >
      <Tab.Screen name={constants.route_names.Home} component={Home} />
      <Tab.Screen name={constants.route_names.Search} component={Search} />
      <Tab.Screen name={constants.route_names.Cart} component={Cart} />
      <Tab.Screen name={constants.route_names.Wishlist} component={Wishlist} />
      <Tab.Screen
        name={constants.route_names.Settings}
        component={Settings}
      />
    </Tab.Navigator>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tab_container: {
    flexDirection: "row",
    height: SIZES.height * 0.1,
    paddingHorizontal: 20,
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 15,
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOffset: {
      width: 0,
      height: -15,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
  tab_item: {
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  icon_style: {
    height: 20,
    width: 20,
  },
  active_tab_item: {
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "rgb(237,117,80)",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  text_style: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
});
