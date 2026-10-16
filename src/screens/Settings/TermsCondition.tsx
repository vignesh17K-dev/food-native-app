import React from "react";
import { Text, TouchableOpacity, View, StyleSheet, Image, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import { ScrollView } from "native-base";

const Terms = ({ navigation }: any) => {


    const sections = [
        {
            title: '1. Acceptance of Terms',
            content:
                'By using food-native-app, you agree to these Terms and Conditions. If you do not agree, please stop using the application.',
        },
        {
            title: '2. User Accounts',
            content:
                'You must provide accurate information when creating an account and keep your login credentials secure. Contact us if you suspect unauthorised access to your account.',
        },
        {
            title: '3. Orders and Delivery',
            content:
                'The application allows users to browse food options, save favourites and place orders. Orders depend on item availability, price confirmation and acceptance. Delivery times are estimates and may change due to traffic, weather or restaurant delays.',
        },
        {
            title: '4. Payments and Refunds',
            content:
                'Prices, taxes, delivery charges and applicable fees will be displayed before order confirmation. Payments may be processed through third-party providers. Cancellations and refunds are subject to the applicable order policy and law.',
        },
        {
            title: '5. Food Safety',
            content:
                'Food ingredients, preparation methods and allergen information may vary by food provider. Users with allergies or dietary restrictions should verify relevant information before ordering.',
        },
        {
            title: '6. Acceptable Use',
            content:
                'You must not use the application for fraud, unlawful activities, unauthorised access or activities that disrupt its operation. Access may be restricted when reasonably necessary to address misuse, subject to applicable law.',
        },
        {
            title: '7. Privacy and Third-Party Services',
            content:
                'Your use of the application is also governed by our Privacy Policy. The application may rely on third-party services for payments, hosting, maps or delivery.',
        },
        {
            title: '8. Liability and Availability',
            content:
                'We aim to keep the application available and accurate but cannot guarantee uninterrupted service. Nothing in these Terms excludes liability or consumer rights that cannot legally be excluded.',
        },
        {
            title: '9. Changes to Terms',
            content:
                'We may update these Terms as the application or applicable law changes. Updated Terms will be published with a revised effective date.',
        },
        {
            title: '10. Governing Law',
            content:
                'These Terms are subject to applicable law. The appropriate governing law and jurisdiction should be specified before publication.',
        },
    ];



    return (
        <SafeAreaView
            style={{
                backgroundColor: "#fff",
                flex: 1,
            }}
        >
            <Header
                container_style={{
                    marginRight: 18,
                    marginHorizontal: SIZES.width * 0.02,
                    marginBottom: 20,
                    marginVertical: 20
                }}
                title={
                    <Text style={{ fontSize: 20, fontWeight: "700" }}>Terms & Conditions</Text>
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
            />


            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
            >

                {sections.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={styles.heading}>{section.title}</Text>
                        <Text style={styles.body}>{section.content}</Text>
                    </View>
                ))}

                <Text style={[styles.heading, { marginTop: 20 }]} >Contact</Text>
                <Text style={styles.body}>
                    For questions about these Terms, contact:
                </Text>

                <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                        Linking.openURL('mailto:vignesh17dev@gmail.com')
                    }
                >
                    <Text style={styles.link}>vignesh17dev@gmail.com</Text>
                </Pressable>

            </ScrollView>



        </SafeAreaView>
    );
}

export default Terms;



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#222222',
        marginBottom: 12,
    },
    meta: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    section: {
        marginTop: 24,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222222',
        marginBottom: 8,
    },
    body: {
        fontSize: 15,
        lineHeight: 24,
        color: '#444444',
    },
    link: {
        color: '#ed7550',
        fontSize: 15,
        marginTop: 8,
        textDecorationLine: 'underline',
    }
});