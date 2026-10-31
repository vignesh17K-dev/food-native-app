import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "../../components/Header";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ACCENT } from "../../../utils/theme/appTheme";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
};

/** Static for now — wire to notifications API later */
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Order confirmed",
    body: "Your order #56823 has been received and is being prepared.",
    time: "2h ago",
    read: false,
    icon: "check-circle-outline",
  },
  {
    id: "2",
    title: "Delivery update",
    body: "Your rider is on the way. Track your order anytime.",
    time: "Yesterday",
    read: true,
    icon: "moped",
  },
  {
    id: "3",
    title: "Welcome to Eat Me",
    body: "Thanks for joining. Explore deals near you today.",
    time: "3d ago",
    read: true,
    icon: "food",
  },
];

const Notifications = ({ navigation }: any) => {
  const { colors, darkMode } = useAppTheme();
  const [items] = useState(MOCK_NOTIFICATIONS);

  const render_item = ({ item }: { item: NotificationItem }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: darkMode
            ? "rgba(255,255,255,0.12)"
            : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.icon_wrap,
          {
            backgroundColor: item.read
              ? colors.surface
              : colors.accentSoft,
            borderWidth: item.read ? StyleSheet.hairlineWidth : 0,
            borderColor: colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={22}
          color={item.read ? colors.textSecondary : ACCENT}
        />
      </View>
      <View style={styles.info}>
        <View style={styles.title_row}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontWeight: item.read ? "600" : "800",
              },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.read ? <View style={styles.unread_dot} /> : null}
        </View>
        <Text
          style={[styles.body, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text style={[styles.time, { color: colors.placeholder }]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safe_area, { backgroundColor: colors.background }]}
    >
      <Header
        container_style={styles.header_container}
        title={
          <Text style={[styles.header_title, { color: colors.text }]}>
            Notifications
          </Text>
        }
        left_section={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={ImageLinks.back_arrow}
              style={[
                styles.back_arrow,
                darkMode && { tintColor: colors.icon },
              ]}
              alt="back"
            />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={render_item}
        contentContainerStyle={[
          styles.list_content,
          items.length === 0 && styles.list_empty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.empty_title, { color: colors.text }]}>
              No notifications
            </Text>
            <Text
              style={[styles.empty_subtitle, { color: colors.textSecondary }]}
            >
              Updates about your orders and offers will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
  },
  header_container: {
    marginRight: 18,
    marginHorizontal: SIZES.width * 0.02,
    marginTop: 12,
    marginBottom: 12,
  },
  header_title: {
    fontSize: 20,
    fontWeight: "700",
  },
  back_arrow: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  list_content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  list_empty: {
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  icon_wrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title_row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
  },
  unread_dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  empty_title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  empty_subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
