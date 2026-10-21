import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import Button from "../../components/Button";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants";
import constants from "../../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";

const CardInfo = ({ navigation }: any) => {
  const { colors } = useAppTheme();
  // TODO: replace with saved cards from API / storage
  const saved_cards: unknown[] = [];

  return (
    <SafeAreaView
      style={[styles.safe_area, { backgroundColor: colors.background }]}
    >
      <Header
        container_style={styles.header_container}
        title={
          <Text style={[styles.header_title, { color: colors.text }]}>
            MY CARDS
          </Text>
        }
        left_section={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={ImageLinks.back_arrow}
              style={[styles.back_arrow]}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.list_content}
        showsVerticalScrollIndicator={false}
      >
        {saved_cards.length === 0 ? (
          <View style={[styles.empty_card, { backgroundColor: colors.surface }]}>
            <EmptyCardsIcon />
            <Text style={[styles.empty_title, { color: colors.text }]}>
              No cards yet
            </Text>
            <Text style={[styles.empty_subtitle, { color: colors.textSecondary }]}>
              Add a debit or credit card to checkout faster. Your saved cards will
              appear here.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          text="Add Card"
          type="primary"
          width="100%"
          onClick={() =>
            navigation.navigate(constants.route_names.AddCard)
          }
        />
      </View>
    </SafeAreaView>
  );
};

function EmptyCardsIcon() {
  const { colors, darkMode } = useAppTheme();

  return (
    <Image
      source={ImageLinks.credit_card}
      style={[
        styles.empty_icon_image,
        darkMode ? { tintColor: colors.icon } : null,
      ]}
      resizeMode="contain"
      accessibilityLabel="No saved cards"
    />
  );
}

export default CardInfo;

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
  },
  back_arrow: {
    resizeMode: "contain",
    height: SIZES.height * 0.04,
  },
  header_container: {
    marginRight: 18,
    marginHorizontal: SIZES.width * 0.02,
    marginTop: 12,
    marginBottom: 12,
  },
  header_title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  list_content: {
    flexGrow: 1,
    paddingHorizontal: SIZES.width * 0.05,
    paddingTop: 8,
    paddingBottom: 16,
  },
  empty_card: {
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginTop: 24,
  },
  empty_icon_image: {
    width: SIZES.width * 0.2,
    height: SIZES.height * 0.05,
    marginBottom: 20,
  },
  empty_title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  empty_subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingBottom: 16,
    paddingTop: 8,
  },
});
