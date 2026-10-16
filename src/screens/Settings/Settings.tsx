import React from "react";
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { SIZES } from "../../../constants";
import ImageLinks from "../../../assets/ImageLink";
import constants from "../../../utils/constants";
import { Divider } from "native-base";
import { supabase } from "../../../supabase.config";
import { useAppToast } from "../../context/AppToast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setLogin } from "../../../store/slices/LoginSlice";
import { useNavigation } from "@react-navigation/native";
import { store } from "../../../store/store";

const Settings = ({ navigation }: any) => {
  const toast = useAppToast();
  const dispatch = useDispatch();
  const navigate: any = useNavigation();


  const handle_logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.show({
        title: error?.message,
        placement: "top",
      });
      return;
    }
    AsyncStorage.clear();
    dispatch(setLogin(false));
    navigate.navigate(constants.route_names.Login);
    store.dispatch({ type: "USER_LOGOUT" });
    navigation.reset({
      index: 0,
      routes: [{ name: constants.route_names.Login }],
    });
  };

  const handle_click = (item: any) => {
    switch (item?.key) {
      case 'logout':
        return handle_logout();
      case 'privacy_policy':
        return navigation.navigate(constants.route_names.PrivacyPolicy);
      case 'terms_&_conditions':
        return navigation.navigate(constants.route_names.Terms);
      case 'check_update':
        return navigation.navigate(constants.route_names.CheckUpdate);
      case 'account_details':
        return navigation.navigate(constants.route_names.AccountDetails);
      case 'change_password':
        return navigation.navigate(constants.route_names.ChangePassword);
      default:
        return;
    }
  };

  const render_item = ({ item, index }: any) => {
    const is_last = index === constants.settings?.length - 1

    return (
      <React.Fragment>
        <TouchableOpacity onPress={() => handle_click(item)}>
          <View style={styles.item_container} >
            <Image
              source={item?.icon}
              style={styles.image_style}
            />
            <Text>{item?.name}</Text>
          </View>
        </TouchableOpacity>


        {!is_last && <Divider style={{ marginTop: 8 }} />}
      </React.Fragment>
    )
  };

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
          <Text style={{ fontSize: 20, fontWeight: "700" }}>Settings</Text>
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

      <FlatList
        data={constants.settings}
        renderItem={render_item}
        keyExtractor={(item) => `${item?.key?.toString()}${item?.name}`}
        contentContainerStyle={styles.settings_container}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}

export default Settings;



const styles = StyleSheet.create({
  settings_container: {
    gap: 12,
    marginHorizontal: 25,
    backgroundColor: 'rgb(245,245,248)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  item_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  image_style: {
    resizeMode: "contain",
    height: SIZES.height * 0.05,
    width: SIZES.width * 0.05,
    tintColor: "#ed7550",
  }
});