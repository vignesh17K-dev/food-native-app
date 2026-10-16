import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import _ from "lodash";
import Header from "../../components/Header";
import Password from "../../components/Password";
import Button from "../../components/Button";
import ImageLinks from "../../../assets/ImageLink";
import { SIZES } from "../../../constants";
import { useAppToast } from "../../context/AppToast";
import { changePassword } from "../../../utils/auth/changePassword";
import { useAppSelector } from "../../../store/hooks";

type ChangePasswordFormValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

const PASSWORD_VALIDATIONS = { required: true, minLength: 6 } as const;

function ChangePassword({ navigation }: any) {
  const toast = useAppToast();
  const [loading, set_loading] = useState(false);
  const auth_user = useAppSelector(
    (state) => state.user.session?.session?.user,
  );

  const { control, handleSubmit, reset } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const on_submit = handleSubmit(async (data) => {
    if (!_.isEqual(data.new_password, data.confirm_password)) {
      toast.show({
        title: "New password and confirm password do not match",
        placement: "top",
        background: "red.800",
      });
      return;
    }

    if (_.isEqual(data.current_password, data.new_password)) {
      toast.show({
        title: "New password must be different from current password",
        placement: "top",
        background: "red.800",
      });
      return;
    }

    set_loading(true);
    try {
      await changePassword(data.current_password, data.new_password, auth_user);
      reset();
      toast.show({
        title: "Password updated successfully",
        placement: "top",
        background: "green.800",
      });
      navigation?.goBack();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update password";
      toast.show({
        title: message,
        placement: "top",
        background: "red.800",
      });
    } finally {
      set_loading(false);
    }
  });

  return (
    <SafeAreaView style={styles.safe_area}>
      <Header
        container_style={styles.header_container}
        title={<Text style={styles.header_title}>CHANGE PASSWORD</Text>}
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scroll_content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form_card}>
            <Password
              name="current_password"
              label="Current Password"
              control={control}
              validations={PASSWORD_VALIDATIONS}
              variant="account"
            />
            <Password
              name="new_password"
              label="New Password"
              control={control}
              validations={PASSWORD_VALIDATIONS}
              variant="account"
            />
            <Password
              name="confirm_password"
              label="Confirm Password"
              control={control}
              validations={PASSWORD_VALIDATIONS}
              variant="account"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            text="Update Password"
            type="primary"
            width="100%"
            disabled={loading}
            loading={loading}
            onClick={on_submit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ChangePassword;

const styles = StyleSheet.create({
  safe_area: {
    backgroundColor: "#fff",
    flex: 1,
  },
  flex: {
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
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  back_arrow: {
    resizeMode: "contain",
    height: SIZES.height * 0.04,
  },
  scroll: {
    flex: 1,
  },
  scroll_content: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingTop: 8,
    paddingBottom: 24,
  },
  form_card: {
    backgroundColor: "rgb(245, 245, 248)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  footer: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingBottom: Platform.OS === "ios" ? 8 : 20,
    paddingTop: 12,
  },
});
