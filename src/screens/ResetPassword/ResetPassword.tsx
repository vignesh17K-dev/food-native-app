import { View } from "native-base";
import { useAppToast } from "../../context/AppToast";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../../constants";
import { Platform, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { useForm } from "react-hook-form";
import { supabase } from "../../../supabase.config";
import { useNavigation } from "@react-navigation/native";
import Password from "../../components/Password";
import _ from "lodash";
import { useDispatch } from "react-redux";
import { setLogin } from "../../../store/slices/LoginSlice";
import LogoHeader from "../../components/LogoHeader";
import utils from "../../../utils/utils";
import constants from "../../../utils/constants";

function ResetPassword() {
  const [loading, set_loading] = useState(false);
  const [user_data, set_user_data] = useState<any>({});
  const toast = useAppToast();
  const { control, handleSubmit } = useForm();
  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const handle_navigate = () => {
    dispatch(setLogin(true));
    set_loading(false);
    navigation.reset({
      index: 0,
      routes: [{ name: constants.route_names?.MainApp  }],
    });
  };

  const handle_update_password = async (new_password: any) => {
    set_loading(true);
    const { error } = await supabase.auth.updateUser({
      password: new_password,
      email: user_data?.email,
    });
    set_loading(false);
    if (error) {
      toast.show({
        title: error?.message,
        placement: "top",
        backgroundColor: "red.800",
      });
      return;
    }

    toast.show({
      title: "Password updated successfully",
      placement: "top",
      backgroundColor: "green.800",
    });
    handle_navigate();
  };

  const onSubmit = handleSubmit((data) => {
    const { new_password, confirm_password } = data;
    if (_.isEqual(new_password, confirm_password)) {
      handle_update_password(new_password);
    } else {
      toast.show({
        title: "Passwords do not match",
        placement: "top",
        backgroundColor: "red.800",
      });
    }
  });

  const handle_get_data = async () => {
    let data = await utils.retrieve_data("user_data");
    data && set_user_data(data);
  };

  useEffect(() => {
    handle_get_data();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
      <LogoHeader
        allow_back={true}
        title={"Create new password"}
        sub_title={
          "Your new password must be different from previous used passwords"
        }
        style={{
          marginBottom: 15,
        }}
      />

      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Password
            name="new_password"
            label="New Password"
            validations={{
              required: true,
              minLength: 6,
            }}
            control={control}
          />

          <Password
            name="confirm_password"
            label="Confirm Password"
            validations={{
              required: true,
              minLength: 6,
            }}
            control={control}
          />
        </View>
      </View>

      <View
        style={{
          alignItems: "center",
          marginVertical: Platform.OS === "android" && 20,
        }}
      >
        <Button
          text={"Reset Password"}
          onClick={onSubmit}
          loading={loading}
          type="primary"
          width={SIZES.width * 0.88}
        />
      </View>
    </SafeAreaView>
  );
}

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    flex: 1,
  },
  img_container: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: SIZES.width * 0.02,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    fontWeight: "700",
    marginVertical: SIZES.height * 0.008,
  },
  text: {
    fontSize: 18,
    marginHorizontal: SIZES.width * 0.1,
    lineHeight: 30,
    textAlign: "center",
    color: COLORS.darkGray,
  },
  textContainer: {
    width: "90%",
    gap: 15,
  },
});
