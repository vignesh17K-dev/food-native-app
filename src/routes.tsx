import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnBoarding from "./screens/OnBoarding/OnBoarding";
import Login from "./screens/Login/Login";
import ForgotPassword from "./screens/ForgotPassword/ForgotPassword";
import ResetPassword from "./screens/ResetPassword/ResetPassword";
import PhoneLogin from "./screens/PhoneLogin/PhoneLogin";
import Otp from "./screens/OtpScreen/Otp";
import TabBar from "./components/Tabs";
import constants from "../utils/constants";
import ProductDetails from "./screens/ProductDetails/ProductDetails";
import CategoryDetails from "./screens/CategoryDetails/CategoryDetails";
import { useAppSelector } from "../store/hooks";
import Terms from "./screens/Settings/TermsCondition";
import PrivacyPolicy from "./screens/Settings/PrivacyPolicy";
import CheckUpdateScreen from "./screens/Settings/CheckUpdateScreen";
import AccountDetails from "./screens/Settings/AccountDetails";
import ChangePassword from "./screens/Settings/ChangePassword";
import Preferences from "./screens/Settings/Preferences";

export type RootStackParamList = {
  onBoarding: undefined;
  forgotPassword: undefined;
  login: undefined;
  resetPassword: undefined;
  phoneLogin: undefined;
  otpScreen: undefined;
  mainApp: undefined;
  productdetails: { id: string };
  categorydetails: { id: string };
  checkupdate: undefined;
  "terms&condition": undefined;
  privacypolicy: undefined;
  accountdetails: undefined;
  changepassword: undefined;
  preferences: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Routes = () => {
  const user_data = useAppSelector((state) => state.user.session);
  const { route_names } = constants;

  return (
    <Stack.Navigator
      initialRouteName={
        "session" in user_data && user_data.session
          ? route_names.MainApp
          : route_names.PreLogin
      }
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name={route_names.PreLogin} component={OnBoarding} />
      <Stack.Screen
        name={route_names.ForgotPassword}
        component={ForgotPassword}
      />
      <Stack.Screen name={route_names.Login} component={Login} />
      <Stack.Screen
        name={route_names.ResetPassword}
        component={ResetPassword}
      />
      <Stack.Screen name={route_names.PhoneLogin} component={PhoneLogin} />
      <Stack.Screen name={route_names.OtpLogin} component={Otp} />
      <Stack.Screen name={route_names.MainApp} component={TabBar} />
      <Stack.Screen
        name={route_names.ProductDetails}
        component={ProductDetails}
      />
      <Stack.Screen
        name={route_names.CategoryDetails}
        component={CategoryDetails}
      />
       <Stack.Screen
        name={route_names.Terms}
        component={Terms}
      />
        <Stack.Screen
        name={route_names.PrivacyPolicy}
        component={PrivacyPolicy}
      />
        <Stack.Screen
        name={route_names.CheckUpdate}
        component={CheckUpdateScreen}
      />
      <Stack.Screen
        name={route_names.AccountDetails}
        component={AccountDetails}
      />
       <Stack.Screen
        name={route_names.ChangePassword}
        component={ChangePassword}
      />
      <Stack.Screen
        name={route_names.Preferences}
        component={Preferences}
      />
    </Stack.Navigator>
  );
};

export default Routes;
