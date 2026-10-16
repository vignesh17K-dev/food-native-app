import React from "react";
import { Text, TouchableOpacity, View, StyleSheet, Image, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import { ScrollView } from "native-base";

const PrivacyPolicy = ({ navigation }: any) => {


    const sections = [
        {
            title: '1. Introduction',
            content:
                'This Privacy Policy explains how food-native-app handles personal information when users create accounts, save favourites, place food orders, make payments or arrange delivery.',
        },
        {
            title: '2. Information We Collect',
            content:
                'Depending on the features used, the application may process account details, saved favourites, delivery addresses, device location where permission is granted, order information, payment transaction references and technical logs where collected.',
        },
        {
            title: '3. How We Use Information',
            content:
                'Information may be used to manage accounts, display favourites, process orders and payments, coordinate delivery, respond to support requests, prevent fraud and meet legal obligations.',
        },
        {
            title: '4. Sharing of Information',
            content:
                'Information may be shared with restaurants, delivery providers, payment processors, hosting providers and other service providers when necessary to operate the application. Information may also be disclosed where required or permitted by law.',
        },
        {
            title: '5. Storage and Security',
            content:
                'The application uses a custom backend. We aim to protect personal information using reasonable security measures. Information is retained only as long as reasonably necessary for service delivery, legal obligations, security and dispute resolution.',
        },
        {
            title: '6. Location and Permissions',
            content:
                'Location information may be used to find relevant food options or support delivery. Users can manage device location permissions through their device settings. Location-dependent features may be limited if permission is disabled.',
        },
        {
            title: '7. User Rights and Account Deletion',
            content:
                'Subject to applicable law, users may request access to, correction of or deletion of their personal information by contacting us. Certain records may need to be retained for legal, accounting, security or dispute-resolution purposes.',
        },
        {
            title: '8. Third-Party Services',
            content:
                'The application may use third-party services for payments, hosting, authentication, maps or delivery. Those providers may process information under their own privacy policies.',
        },
        {
            title: "9. Children's Privacy",
            content:
                "The application's intended age group and any required safeguards must be confirmed before publication. Personal information will be handled in accordance with applicable requirements concerning children.",
        },
        {
            title: '10. Policy Updates',
            content:
                'We may update this Privacy Policy when the application, its services or applicable laws change. The latest version will be published with a revised effective date.',
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
                    marginVertical: 20
                }}
                title={
                    <Text style={{ fontSize: 20, fontWeight: "700" }}>Privacy Policy</Text>
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
                <Text style={styles.body}  >
                    For privacy questions, requests or complaints:
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

export default PrivacyPolicy;

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