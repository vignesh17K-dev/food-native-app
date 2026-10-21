import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import CartIcon from "../../components/CartIcon";
import ThemedScreen from "../../components/ThemedScreen";
import { useAppTheme } from "../../hooks/useAppTheme";
import CartLineItemCard from "../../components/CartLineItemCard";
import { flattenCartProducts } from "../../../utils/cart/flattenCartProducts";
import { calculateCartSubtotal } from "../../../utils/cart/cartTotals";
import type { DeliveryAddress } from "../../hooks/useGetLocation";
import utils from "../../../utils/utils";
import constants from "../../../utils/constants";
import { ACCENT } from "../../../utils/theme/appTheme";
import paymentCards, { type SavedCard } from "../../../utils/api/payment";
import { map } from "lodash";
import SavedPaymentCardRow from "../../components/SavedPaymentCardRow";

function isDeliveryAddress(value: unknown): value is DeliveryAddress {
    if (!value || typeof value !== "object") {
        return false;
    }
    const record = value as DeliveryAddress;
    return (
        typeof record.latitude === "number" &&
        typeof record.longitude === "number" &&
        typeof record.formattedAddress === "string"
    );
}

const Checkout = ({ navigation }: any) => {
    const { colors, darkMode } = useAppTheme();
    const checkout_footer_background = darkMode
        ? colors.surface
        : colors.surfaceElevated;
    const [deliveryAddress, setDeliveryAddress] =
        useState<DeliveryAddress | null>(null);
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    const cart_data = useSelector((state: any) => state?.cart?.cart_data);
    const cart_items = useMemo(
        () => flattenCartProducts(cart_data?.products),
        [cart_data?.products],
    );


    const cart_subtotal = useMemo(
        () => calculateCartSubtotal(cart_items),
        [cart_items],
    );
    const shipping_fee = 0;
    const cart_total = cart_subtotal + shipping_fee;

    useFocusEffect(
        useCallback(() => {
            let cancelled = false;

            (async () => {
                setCardsLoading(true);
                try {
                    const [stored, cardsResponse] = await Promise.all([
                        utils.retrieve_data(
                            constants.storage_keys.deliveryAddress,
                        ),
                        paymentCards.get_all_cards(),
                    ]);
                    if (cancelled) {
                        return;
                    }
                    const cards = cardsResponse?.data ?? [];
                    setDeliveryAddress(isDeliveryAddress(stored) ? stored : null);
                    setSavedCards(cards);
                    setSelectedCardId((prev) => {
                        if (prev && cards.some((card) => card?.payment_method_id === prev)) {
                            return prev;
                        }
                        return cards?.[0]?.payment_method_id ?? null;
                    });
                } catch {
                    if (!cancelled) {
                        setSavedCards([]);
                        setSelectedCardId(null);
                    }
                } finally {
                    if (!cancelled) {
                        setCardsLoading(false);
                    }
                }
            })();

            return () => {
                cancelled = true;
            };
        }, []),
    );


    const handle_place_order = ()=>{

    };

    const render_summary_row = (label: string, amount: number, bold = false) => (
        <View style={styles.summary_row}>
            <Text
                style={[
                    styles.summary_label,
                    { color: colors.text },
                    bold && styles.summary_bold,
                ]}
            >
                {label}
            </Text>
            <Text
                style={[
                    styles.summary_value,
                    { color: colors.text },
                    bold && styles.summary_bold,
                ]}
            >
                ${amount.toFixed(2)}
            </Text>
        </View>
    );


    const handle_render_payment_method = () => {
        return (
            <View style={styles.payment_section}>
                <View style={styles.section_header}>
                    <Text style={[styles.section_title, { color: colors.text }]}>
                        Payment Method
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(constants.route_names.CardInfo)
                        }
                    >
                        <Text style={styles.add_card_link}>Add card</Text>
                    </TouchableOpacity>
                </View>

                {cardsLoading ? (
                    <ActivityIndicator
                        color={ACCENT}
                        style={styles.cards_loader}
                    />
                ) : savedCards.length === 0 ? (
                    <View
                        style={[
                            styles.payment_empty,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.payment_empty_text,
                                { color: colors.textSecondary },
                            ]}
                        >
                            No saved cards. Add a card to continue.
                        </Text>
                    </View>
                ) : (
                    map(savedCards, (card) => (
                        <SavedPaymentCardRow
                            key={card?.payment_method_id}
                            card={card}
                            selected={selectedCardId === card?.payment_method_id}
                            onPress={() => setSelectedCardId(card?.payment_method_id)}
                        />
                    ))
                )}
            </View>
        );
    }


    const handle_render_delivery_address = () => {
        return (
            <View style={{ marginTop: 10 }}>
                <Text style={[styles.section_title, { color: colors.text }]}>
                    Delivery Address
                </Text>
                <View
                    style={[
                        styles.address_card,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >

                    <View style={styles.address_row}>
                        <Image
                            source={ImageLinks.location}
                            style={[styles.location_icon, { tintColor: ACCENT }]}
                            resizeMode="contain"
                            accessibilityLabel="Location"
                        />
                        <Text
                            style={[
                                styles.address_text,
                                {
                                    color: deliveryAddress
                                        ? colors.text
                                        : colors.placeholder,
                                },
                            ]}
                            numberOfLines={3}
                        >
                            {deliveryAddress?.formattedAddress ??
                                "No delivery address selected"}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <ThemedScreen>
            <Header
                container_style={{
                    marginRight: 18,
                    marginHorizontal: SIZES.width * 0.02,
                    marginBottom: 10,
                }}
                title={
                    <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
                        CHECKOUT
                    </Text>
                }
                left_section={
                    <TouchableOpacity onPress={() => navigation?.goBack()}>
                        <Image
                            source={ImageLinks?.back_arrow}
                            style={{
                                resizeMode: "contain",
                                height: SIZES.height * 0.04,
                            }}
                            alt="logo"
                        />
                    </TouchableOpacity>
                }
                right_section={<CartIcon />}
            />


            <View style={styles.content}>
                <FlatList
                    data={cart_items}
                    style={styles.list}
                    keyExtractor={(item) =>
                        `${item.product_id}-${item.cart_item_id}-${item.selectedSize ?? ""}`
                    }
                    renderItem={({ item }) => (
                        <CartLineItemCard item={item} editable={false} />
                    )}
                    contentContainerStyle={styles.list_content}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={[styles.empty_text, { color: colors.textSecondary }]}>
                            Your cart is empty
                        </Text>
                    }
                    ListFooterComponent={
                        <View style={{ flexDirection: 'column' , gap: 10}}>
                            {handle_render_delivery_address()}
                            {handle_render_payment_method()}
                        </View>

                    }
                />
            </View>

            <View
                style={[
                    styles.checkout_footer,
                    {
                        backgroundColor: checkout_footer_background,
                        borderTopColor: colors.border,
                    },
                ]}
            >
                {render_summary_row("Subtotal", cart_subtotal)}
                {render_summary_row("Shipping fee", shipping_fee)}
                <View
                    style={[styles.summary_divider, { backgroundColor: colors.border }]}
                />
                {render_summary_row("Total:", cart_total, true)}
                <TouchableOpacity
                    style={styles.place_order_btn}
                    activeOpacity={0.85}
                    onPress={() => handle_place_order()}
                >
                    <Text style={styles.place_order_text}>Place your Order</Text>
                </TouchableOpacity>
            </View>
        </ThemedScreen>
    );
};

export default Checkout;

const styles = StyleSheet.create({
    content: {
        flex: 1,
        marginTop: 10,
    },
    payment_section: {
        gap: 10,
    },
    section_header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    add_card_link: {
        color: ACCENT,
        fontSize: 14,
        fontWeight: "600",
    },
    cards_loader: {
        marginVertical: 16,
    },
    payment_empty: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
    },
    payment_empty_text: {
        fontSize: 14,
        lineHeight: 20,
    },
    address_card: {
        marginVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 10,
    },
    section_title: {
        fontSize: 16,
        fontWeight: "700",
    },
    address_row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    location_icon: {
        width: 20,
        height: 20,
        marginTop: 2,
    },
    address_text: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "500",
    },
    list: {
        flex: 1,
    },
    list_content: {
        flexGrow: 1,
        gap: 12,
        marginHorizontal: 20,
        paddingBottom: 16,
    },
    empty_text: {
        textAlign: "center",
        marginTop: 40,
        fontSize: 15,
    },
    checkout_footer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    summary_row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    summary_label: {
        fontSize: 16,
        fontWeight: "400",
    },
    summary_value: {
        fontSize: 16,
        fontWeight: "700",
    },
    summary_bold: {
        fontWeight: "700",
        fontSize: 17,
    },
    summary_divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 10,
    },
    place_order_btn: {
        marginTop: 16,
        backgroundColor: "#ed7550",
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    place_order_text: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
});
