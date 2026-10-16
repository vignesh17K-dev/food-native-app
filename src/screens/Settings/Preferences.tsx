import React from "react";
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants";
import { useAppDispatch } from "../../../store/hooks";
import { setDarkMode } from "../../../store/slices/PreferencesSlice";
import { useAppTheme } from "../../hooks/useAppTheme";

const ACCENT = "#ed7550";

function Preferences({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { darkMode, colors } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safe_area, { backgroundColor: colors.background }]}
    >
      <Header
        container_style={styles.header_container}
        title={
          <Text style={[styles.header_title, { color: colors.text }]}>
            PREFERENCES
          </Text>
        }
        left_section={
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={ImageLinks?.back_arrow}
              style={styles.back_arrow}
              alt="back"
            />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <View style={styles.row_text}>
              <Text style={[styles.row_title, { color: colors.text }]}>
                Dark mode
              </Text>
              <Text
                style={[styles.row_subtitle, { color: colors.textSecondary }]}
              >
                Use a dark appearance across the app
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                dispatch(setDarkMode(value));
              }}
              trackColor={{ false: "#d1d1d6", true: ACCENT }}
              thumbColor="#ffffff"
              ios_backgroundColor="#d1d1d6"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Preferences;

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
  },
  header_container: {
    marginRight: 18,
    marginHorizontal: SIZES.width * 0.02,
    marginVertical: 16,
  },
  header_title: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  back_arrow: {
    resizeMode: "contain",
    height: SIZES.height * 0.04,
  },
  content: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingTop: 8,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  row_text: {
    flex: 1,
  },
  row_title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  row_subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
