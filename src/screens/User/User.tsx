import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "../../components/Header";
import ImageLinks from "../../../assets/ImageLink";
import { COLORS, SIZES } from "../../../constants";
import { useAppSelector } from "../../../store/hooks";
import { displayValue } from "../../../utils/account/profileHelpers";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ACCENT } from "../../../utils/theme/appTheme";
import { map } from "lodash";

const MENU_ITEMS = [
  {
    key: "orders",
    label: "My Orders",
    icon: "package-variant-closed",
    route: null,
  },
  {
    key: "notifications",
    label: "My Notifications",
    icon: "bell-outline",
    route: null,
  },
] as const;

const User = ({ navigation }: any) => {
  const auth_user = useAppSelector(
    (state) => state.user.session?.session?.user,
  );
  const { colors, darkMode } = useAppTheme();

  const full_name =
    (auth_user?.user_metadata?.full_name as string | undefined) ||
    auth_user?.email?.split("@")[0] ||
    "User";
  const email = auth_user?.email ?? "";
  const phone = displayValue(
    (auth_user?.user_metadata?.phone as string | undefined) ||
    auth_user?.phone,
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={ImageLinks.profile_header_bg}
        style={styles.top_section}
        imageStyle={styles.top_section_image}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]}>
          <Header
            container_style={styles.header_container}
            title={<Text style={styles.header_title}>Profile</Text>}
            left_section={
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  source={ImageLinks.back_arrow}
                  style={styles.back_arrow}
                  alt="back"
                />
              </TouchableOpacity>
            }
          />

          <View style={styles.content}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: darkMode ? colors.surface : "#ffffff",
                  borderColor: darkMode
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                  borderWidth: darkMode ? StyleSheet.hairlineWidth : 0,
                },
              ]}
            >
              <Image
                source={ImageLinks.profile}
                style={styles.avatar}
                alt="profile"
              />
              <View style={styles.info}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {full_name}
                  </Text>
                  <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}
                    >
                      Gold Member
                    </Text>
                  </View>
                </View>

                {!!email && (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    {email}
                  </Text>
                )}
                {phone !== "Not updated" && (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    {phone}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <View style={[styles.bottom_section, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={["bottom"]} style={styles.bottom_inner}>
          <View
            style={[
              styles.menu_card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {map(MENU_ITEMS, (item, index) => (
              <React.Fragment key={item.key}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.menu_row}
                  onPress={() => {
                    if (item.route) {
                      navigation.navigate(item.route);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.menu_icon_wrap,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={ACCENT}
                    />
                  </View>
                  <Text style={[styles.menu_label, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {index < MENU_ITEMS.length - 1 ? (
                  <View
                    style={[styles.menu_divider, { backgroundColor: colors.border }]}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default User;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  top_section: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  top_section_image: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  bottom_section: {
    flex: 1,
  },
  bottom_inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menu_card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  menu_row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  menu_icon_wrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menu_label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  menu_divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
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
    color: "#ffffff",
  },
  back_arrow: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    tintColor: "#ffffff",
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 4,
    paddingBottom: 16,
  },
  card: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  info: {
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  meta: {
    fontSize: 14,
    marginTop: 2,
  },
});
