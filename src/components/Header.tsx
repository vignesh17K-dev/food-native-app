import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  container_style?: any;
  left_section?: any;
  right_section?: any;
  title?: any;
}

const Header = ({
  container_style,
  left_section,
  right_section,
  title,
}: Props) => {
  return (
    <View style={[styles.container, container_style]}>
      <View style={styles.side}>{left_section}</View>
      <View style={styles.title_wrap}>
        {typeof title === "string" || typeof title === "number" ? (
          <Text style={styles.title_text}>{title}</Text>
        ) : (
          title
        )}
      </View>
      <View style={[styles.side, styles.side_right]}>{right_section}</View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    minWidth: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  side_right: {
    alignItems: "flex-end",
  },
  title_wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title_text: {
    fontSize: 20,
    fontWeight: "700",
  },
});
