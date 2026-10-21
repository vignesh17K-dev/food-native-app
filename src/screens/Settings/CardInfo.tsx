import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../../components/Header";
import Button from "../../components/Button";
import ImageLinks from "../../../assets/ImageLink";
import {  SIZES } from "../../../constants";
import constants from "../../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAppToast } from "../../context/AppToast";
import paymentCards, { type SavedCard } from "../../../utils/api/payment";
import { ACCENT } from "../../../utils/theme/appTheme";
import { map } from "lodash";
import SavedPaymentCardRow from "../../components/SavedPaymentCardRow";

function apiErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "string") {
        return error;
    }
    if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return fallback;
}

const CardInfo = ({ navigation }: any) => {
    const { colors, darkMode } = useAppTheme();
    const toast = useAppToast();
    const [cards, setCards] = useState<SavedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);


    const BrandCards = [
        {
            brand: "Visa",
            icon: ImageLinks.visa_card,
            id: 1
        },
        {
            brand: "Mastercard",
            icon: ImageLinks.master_card,
            id: 2
        },
    ]

    const loadCards = useCallback(async () => {
        setLoading(true);
        try {
            const response = await paymentCards.get_all_cards();
            setCards(response?.data ?? []);
        } catch (error) {
            toast.show({
                title: apiErrorMessage(error, "Failed to load cards"),
                background: "red.800",
            });
            setCards([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useFocusEffect(
        useCallback(() => {
            loadCards();
        }, [loadCards]),
    );

    const handleDelete = (card: SavedCard) => {
        Alert.alert(
            "Remove card",
            `Remove ${card.brand} •••• ${card.last4}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeletingId(card.payment_method_id);
                        try {
                            const response = await paymentCards.delete_card(card.payment_method_id);
                            toast.show({
                                title: response?.message ?? "Card removed",
                                background: "green.800",
                            });
                            setCards((prev) => prev.filter((item) => item.payment_method_id !== card.payment_method_id));
                        } catch (error) {
                            toast.show({
                                title: apiErrorMessage(error, "Failed to delete card"),
                                background: "red.800",
                            });
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ],
        );
    };

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

            {loading ? (
                <View style={styles.loader_wrap}>
                    <ActivityIndicator size="large" color={ACCENT} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.list_content}
                    showsVerticalScrollIndicator={false}
                >
                    {cards.length === 0 ? (
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
                    ) : (
                        cards.map((card) => (
                            <SavedPaymentCardRow
                                key={card?.payment_method_id}
                                card={card}
                                rightSlot={
                                    <TouchableOpacity
                                        onPress={() => handleDelete(card)}
                                        disabled={deletingId === card?.payment_method_id}
                                        style={styles.delete_btn}
                                        accessibilityLabel={`Delete ${card.brand} card ending in ${card.last4}`}
                                    >
                                        {deletingId === card?.payment_method_id ? (
                                            <ActivityIndicator size="small" color={ACCENT} />
                                        ) : (
                                            <Image
                                                source={ImageLinks._delete}
                                                style={[styles.delete_icon, { tintColor: ACCENT }]}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </TouchableOpacity>
                                }
                            />
                        ))
                    )}


                    <View style={styles.brand_cards_container}>
                        <Text
                            style={[
                                styles.brand_cards_title,
                                { color: colors.text },
                            ]}
                        >
                            Add new card
                        </Text>

                        {map(BrandCards, (brand) => {
                            const selected = selectedBrand === brand.brand;
                            return (
                                <TouchableOpacity
                                    key={brand.id}
                                    style={[
                                        styles.brand_card_item,
                                        {
                                            borderColor: selected
                                                ? ACCENT
                                                : darkMode
                                                  ? "rgba(0,0,0,0.18)"
                                                  : colors.border,
                                            borderWidth: selected ? 2 : 1,
                                        },
                                    ]}
                                    onPress={() => setSelectedBrand(brand.brand)}
                                >
                                    <Image
                                        source={brand.icon}
                                        style={styles.brand_icon}
                                    />
                                    <Text
                                        style={[
                                            styles.brand_card_label,
                                            { color: colors.fieldText },
                                        ]}
                                    >
                                        {brand.brand}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                </ScrollView>
            )}

            <View style={styles.footer}>
                <Button
                    text="Add"
                    type="primary"
                    width="100%"
                    disabled={!selectedBrand}
                    onClick={() => {
                        if (!selectedBrand) {
                            return;
                        }
                        navigation.navigate(constants.route_names.AddCard, {
                            brand: selectedBrand as "Visa" | "Mastercard",
                        });
                    }}
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
    loader_wrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    list_content: {
        flexGrow: 1,
        paddingHorizontal: SIZES.width * 0.05,
        paddingTop: 8,
        paddingBottom: 16,
        gap: 12,
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
    brand_icon: {
        width: 56,
        height: 36,
        borderRadius: 6,
    },
    delete_btn: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    delete_icon: {
        width: 16,
        height: 16,
    },
    footer: {
        paddingHorizontal: SIZES.width * 0.05,
        paddingBottom: 16,
        paddingTop: 8,
    },
    brand_cards_container: {
        marginVertical: 10,
        width: "100%",
        alignSelf: "stretch",
    },
    brand_cards_title: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 12,
    },

    brand_card_item: {
        width: "100%",
        alignSelf: "stretch",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        marginBottom: 12,
        paddingVertical: 20,
        paddingHorizontal: 14,
    },
    brand_card_label: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});
