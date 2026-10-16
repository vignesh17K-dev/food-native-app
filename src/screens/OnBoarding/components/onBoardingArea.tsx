import React, { useRef, useState } from "react";
import { View, Image, Animated, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import OnBoardingCard from "./onBoardingCard";
import Button from "../../../components/Button";
import { SIZES, COLORS } from "../../../../constants";
import { useNavigation } from "@react-navigation/native";
import { ON_BOARDING_CONTANTS } from "../contants";
import { Platform } from "react-native";
import ImageLinks from "../../../../assets/ImageLink";
import constants from "../../../../utils/constants";
import { useAppTheme } from "../../../hooks/useAppTheme";

function OnBoardingArea() {
  const { colors } = useAppTheme();
  const [tab, set_tab] = useState(0);

  const scroll_x: any = useRef(new Animated.Value(0)).current;
  const flat_list_ref: any = useRef(FlatList);
  const navigate: any = useNavigation();
  const data = ON_BOARDING_CONTANTS?.data;

  // eslint-disable-next-line no-unused-vars
  const on_scroll_change = useRef(({ viewableItems, changed }) => {
    set_tab(viewableItems[0]?.index);
  });

  const handle_next_tab = () => {
    if (tab < data.length - 1) {
      flat_list_ref?.current?.scrollToIndex({
        animated: true,
        index: tab + 1,
      });
    } else {
      handle_skip();
    }
  };

  const handle_skip = () => {
    navigate.navigate(constants.route_names.Login);
  };

  const render_dot = () => {
    const dot_position = Animated.divide(scroll_x, SIZES?.width);
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {data.map((ele, index) => {
          let dotColor = dot_position.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [
              COLORS.lightOrange,
              COLORS.primary,
              COLORS.lightOrange,
            ],
            extrapolate: "clamp",
          });

          let dotWidth = dot_position.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [10, 30, 10],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={`dot-${index}`}
              style={{
                width: dotWidth,
                height: 10,
                backgroundColor: dotColor,
                borderRadius: 50,
                margin: 10,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.logoContainer}>
        <Image
          source={ImageLinks?.logo}
          style={{
            resizeMode: "contain",
            width: SIZES.width * 0.5,
            marginTop: 20,
            height: 100,
          }}
        />
      </View>
      <Animated.FlatList
        horizontal
        ref={flat_list_ref}
        pagingEnabled
        bounces={false}
        data={data}
        initialScrollIndex={tab}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        onViewableItemsChanged={on_scroll_change.current}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scroll_x } } }],
          { useNativeDriver: false }
        )}
        keyExtractor={(item: any) => item?.id}
        renderItem={({ item, index }) => {
          return (
            <OnBoardingCard
              index={index}
              key={index}
              image={item.image}
              background={item.background}
              title={item.title}
              text={item.text}
            />
          );
        }}
      />
      {render_dot()}
      <SafeAreaView
        style={{
          marginVertical: Platform.OS === "android" && 20,
        }}
      >
        <View style={styles.footerButton}>
          {tab === data.length - 1 && (
            <React.Fragment>
              <Button
                text="Let's Get Started"
                type="primary"
                width={SIZES.width * 0.8}
                onClick={handle_next_tab}
              />
            </React.Fragment>
          )}
          {tab < data.length - 1 && (
            <React.Fragment>
              <Button
                text="Skip"
                type="secondary"
                onClick={handle_skip}
                width={SIZES.width * 0.2}
              />
              <Button
                text="Next"
                type="primary"
                width={200}
                onClick={handle_next_tab}
              />
            </React.Fragment>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    position: "absolute",
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
    left: 0,
    right: 0,
    top: SIZES.height > 800 ? 50 : 25,
  },
  footerButton: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems:'center'
  },
  scrollContainer: {
    width: SIZES.width,
  },
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },
  image: {
    width: SIZES.width * 0.75,
    height: SIZES.width * 0.75,
    marginBottom: -SIZES.padding,
  },
  textBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.radius,
  },
  title: {
    fontSize: 25,
    textAlign: "center",
    fontWeight: "700",
    marginVertical: 15,
  },
  text: {
    fontSize: 18,
    lineHeight: 30,
    textAlign: "center",
    color: COLORS.darkGray,
  },
});

export default OnBoardingArea;
