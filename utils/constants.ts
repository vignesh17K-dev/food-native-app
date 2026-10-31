import { icons } from "../constants"
import mock_data from "../constants/dummyData";

const constants = {
    route_names: {
        PreLogin: "onBoarding",
        ForgotPassword: "forgotPassword",
        Login: "login",
        ResetPassword: "resetPassword",
        PhoneLogin: "phoneLogin",
        OtpLogin: "otpScreen",
        MainApp: "mainApp",
        Home: "home",
        Search: "search",
        Cart: "cart",
        Wishlist: "wishlist",
        Settings: "settings",
        ProductDetails: "productdetails",
        CategoryDetails: "categorydetails",
        Terms: 'terms&condition',
        PrivacyPolicy: 'privacypolicy',
        CheckUpdate: 'checkupdate',
        AccountDetails:'accountdetails',
        User: 'user',
        MyOrders: 'myorders',
        Notifications: 'notifications',
        ChangePassword:'changepassword',
        Preferences: 'preferences',
        CardInfo: 'cardinfo',
        AddCard: 'addcard',
        Checkout: 'checkout',
        OrderConfirmed: 'orderconfirmed',
        DeliveryStatus: 'deliverystatus',
        MapView: 'mapview',
    } as const,
    storage_keys: {
        deliveryAddress: "delivery_address",
    },
    pusher: {
        apiKey: "3b9ac8d21967a2239e94",
        cluster: "ap2",
    },

    bottom_tabs: [
        {
            id: 0,
            label: "Home",
            route: "home",
            icon: icons.home,
        },
        {
            id: 1,
            label: "Search",
            route: 'search',
            icon: icons.search,
        },
        {
            id: 2,
            label: "Cart",
            route: 'cart',
            icon: icons.cart
        },
        {
            id: 3,
            label: "Favourite",
            route: 'wishlist',
            icon: icons.favourite
        },
        {
            id: 4,
            label: "Settings",
            route: 'settings',
            icon: icons.setting
        },
    ],
    sections: [
        { section: "delivery", data: [] },
        { section: "category", data: mock_data.categories },
        { section: "popular", data: mock_data.popular_rails },
        { section: "menu", data: mock_data.menu_data },
    ],
    onboarding_screens: [
        {
            id: 1,
            backgroundImage: require("../assets/images/background_01.png"),
            bannerImage: require("../assets/images/favourite_food.png"),
            title: "Choose a Favourite Food",
            description: "When you oder Eat Steet, we’ll hook you up with exclusive coupon, specials and rewards"
        },
        {
            id: 2,
            backgroundImage: require("../assets/images/background_02.png"),
            bannerImage: require("../assets/images/hot_delivery.png"),
            title: "Hot Delivery to Home",
            description: "We make food ordering fasr, simple and free-no matter if you order online or cash"
        },
        {
            id: 3,
            backgroundImage: require("../assets/images/background_01.png"),
            bannerImage: require("../assets/images/great_food.png"),
            title: "Receive the Great Food",
            description: "You’ll receive the great food within a hour. And get free delivery credits for every order."
        }
    ],
    screens: {
        main_layout: "MainLayout",
        home: "Home",
        search: "Search",
        cart: "Cart",
        favourite: "Favourite",
        notification: "Notification",
        my_wallet: "My Wallet",
    },
    delivery_time: [
        {
            id: 1,
            label: "10 Mins",
            minutes: 10,
        },
        {
            id: 2,
            label: "20 Mins",
            minutes: 20,
        },
        {
            id: 3,
            label: "30 Mins",
            minutes: 30,
        }
    ],
    ratings: [
        {
            id: 1,
            label: 1,
        },
        {
            id: 2,
            label: 2,
        },
        {
            id: 3,
            label: 3,
        },
        {
            id: 4,
            label: 4,
        },
        {
            id: 5,
            label: 5,
        }
    ],
    tags: [
        {
            id: 1,
            label: "Burger",
            slug: "burger",
        },
        {
            id: 2,
            label: "Fast Food",
            slug: "fast-food",
        },
        {
            id: 3,
            label: "Pizza",
            slug: "pizza",
        },
        {
            id: 4,
            label: "Asian",
            slug: "asian",
        },
        {
            id: 5,
            label: "Dessert",
            slug: "dessert",
        },
        {
            id: 6,
            label: "Breakfast",
            slug: "breakfast",
        },
        {
            id: 7,
            label: "Vegetable",
            slug: "veg",
        },
        {
            id: 8,
            label: "Taccos",
            slug: "tacos",
        }
    ],
    settings: [
        {
            name: 'Account Details',
            key: 'account_details',
            icon: icons.account
        },
        {
            name: 'Card Info',
            key: 'card_info',
            icon: icons.card
        },
        {
            name: 'Change Password',
            key: 'change_password',
            icon: icons.password_change
        },
        {
            name: 'Preferences',
            key: 'preferences',
            icon: icons.preference
        },
        {
            name: 'Check Update',
            key: 'check_update',
            icon: icons.update
        },
        {
            name: 'Privacy Policy',
            key: 'privacy_policy',
            icon: icons.privacy
        },
        {
            name: 'Terms & Conditions',
            key: 'terms_&_conditions',
            icon: icons.terms
        },
        {
            name: 'Logout',
            key: 'logout',
            icon: icons.logout
        },
    ],
    default_map_region: {
        latitude: 37.774929,
        longitude: -122.419416,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    },
    delivery_steps: [
        {
            id: "order_confirmed",
            title: "Order Confirmed",
            subtitle: "Your order has been received",
        },
        {
            id: "order_preparing",
            title: "Order Prepared",
            subtitle: "Your order has been prepared",
        },
        {
            id: "on_the_way",
            title: "Delivery in Progress",
            subtitle: "Hang on!, your food is on the way",
        },
        {
            id: "delivered",
            title: "Delivered",
            subtitle: "Enjoy your meal!",
        },
    ],
    order_statuses: [
        {
            key: "confirmed",
            title: "Order Confirmed",
            description: "Restaurant has confirmed your order",
        },
        {
            key: "prepared",
            title: "Food Prepared",
            description: "Your food is ready",
        },
        {
            key: "out_for_delivery",
            title: "Out for Delivery",
            description: "Your order is on its way",
        },
        {
            key: "delivered",
            title: "Delivered",
            description: "Your order has been delivered",
        },
    ],
}

export const ORDER_STATUSES = constants.order_statuses;

export default constants