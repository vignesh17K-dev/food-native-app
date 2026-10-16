import React, { useEffect, useMemo, useState } from "react";
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
import { Divider } from "native-base";
import { FieldPath, useForm } from "react-hook-form";
import type { User } from "@supabase/supabase-js";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import PhoneNumberField from "../../components/PhoneNumberField";
import DropdownField from "../../components/DropdownField";
import DateField from "../../components/DateField";
import Button from "../../components/Button";
import { SIZES } from "../../../constants";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import ImageLinks from "../../../assets/ImageLink";
import { supabase } from "../../../supabase.config";
import { setSession } from "../../../store/slices/User";
import { useAppToast } from "../../context/AppToast";
import {
    displayValue,
    formatDobDisplay,
    formatPhoneDisplay,
    formatPhoneFull,
    NOT_UPDATED,
    resolvePhoneParts,
} from "../../../utils/account/profileHelpers";
import {
    ACCOUNT_EDIT_FIELDS,
    AccountEditFieldConfig,
} from "../../../utils/account/accountFormConfig";

const ACCENT = "#ed7550";

type AccountFormValues = {
    full_name: string;
    phone_number: string;
    country_code: string;
    date_of_birth: string;
    gender: string;
    email: string;
    address: string;
};

type DetailRowProps = {
    label: string;
    value: string;
    multiline?: boolean;
    is_last?: boolean;
};

const DetailRow = ({ label, value, multiline, is_last }: DetailRowProps) => (
    <View>
        <View style={styles.row}>
            <Text style={styles.row_label}>{label}</Text>
            <Text
                style={[styles.row_value, multiline && styles.row_value_multiline]}
                numberOfLines={multiline ? 4 : 2}
            >
                {value}
            </Text>
        </View>
        {!is_last && <Divider style={styles.row_divider} />}
    </View>
);

function formatJoined(created_at?: string): string {
    if (!created_at) {
        return NOT_UPDATED;
    }
    const date = new Date(created_at);
    if (Number.isNaN(date.getTime())) {
        return NOT_UPDATED;
    }
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatUserId(id?: string): string {
    if (!id) {
        return NOT_UPDATED;
    }
    const compact = id.replace(/-/g, "").slice(-8);
    if (compact.length < 4) {
        return id;
    }
    const mid = Math.ceil(compact.length / 2);
    return `${compact.slice(0, mid)} ${compact.slice(mid)}`;
}

function metadataValue(user: User | undefined, key: string): string {
    const value = user?.user_metadata?.[key];
    if (value == null || value === "") {
        return "";
    }
    return String(value);
}

function resolveFullName(user: User | undefined) {
    return (
        metadataValue(user, "full_name") ||
        user?.user_metadata?.username ||
        user?.user_metadata?.name ||
        (user?.email ? user.email.split("@")[0] : "")
    );
}

function resolveDateOfBirth(user: User | undefined) {
    return metadataValue(user, "date_of_birth") || metadataValue(user, "dob");
}

function buildViewSections(user: User | undefined) {
    const phone_parts = resolvePhoneParts(user);

    const primary = [
        {
            label: "Full Name",
            value: displayValue(resolveFullName(user)),
        },
        {
            label: "Phone Number",
            value: formatPhoneDisplay(phone_parts),
        },
        { label: "User ID", value: formatUserId(user?.id) },
    ];

    const extended = [
        {
            label: "Date of Birth",
            value: formatDobDisplay(resolveDateOfBirth(user)),
        },
        { label: "Gender", value: displayValue(metadataValue(user, "gender")) },
        { label: "Joined", value: formatJoined(user?.created_at) },
        { label: "Email", value: user?.email ?? NOT_UPDATED },
        {
            label: "Address",
            value: displayValue(metadataValue(user, "address")),
            multiline: true,
        },
    ];

    return { primary, extended };
}

function buildDefaultValues(user: User | undefined): AccountFormValues {
    const { country_code, phone_number } = resolvePhoneParts(user);

    return {
        full_name: resolveFullName(user) || "",
        phone_number,
        country_code,
        date_of_birth: resolveDateOfBirth(user),
        gender: metadataValue(user, "gender"),
        email: user?.email ?? "",
        address: metadataValue(user, "address"),
    };
}

const AccountDetails = ({ navigation }: any) => {
    const dispatch = useAppDispatch();
    const toast = useAppToast();
    const auth_user = useAppSelector((state) => state.user.session?.session?.user);

    console.log("auth_user", auth_user);

    const [edit_mode, set_edit_mode] = useState(false);
    const [saving, set_saving] = useState(false);

    const { control, handleSubmit, reset, setValue, watch, clearErrors } =
        useForm<AccountFormValues>({
            defaultValues: buildDefaultValues(auth_user),
        });

    const country_code = watch("country_code");

    useEffect(() => {
        if (!edit_mode) {
            reset(buildDefaultValues(auth_user));
        }
    }, [auth_user?.id, edit_mode, reset]);

    useEffect(() => {
        if (!country_code) {
            setValue("country_code", "+1");
        }
    }, [country_code, setValue]);

    const { primary, extended } = useMemo(
        () => buildViewSections(auth_user),
        [auth_user],
    );

    const handle_cancel = () => {
        clearErrors();
        reset(buildDefaultValues(auth_user));
        set_edit_mode(false);
    };

    const enter_edit_mode = () => {
        reset(buildDefaultValues(auth_user));
        set_edit_mode(true);
    };

    const exit_edit_mode = () => {
        reset(buildDefaultValues(auth_user));
        set_edit_mode(false);
    };

    const on_save = handleSubmit(async (values) => {
        set_saving(true);
        try {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                throw authError ?? new Error("Not authenticated");
            }

            const phone_parts = {
                country_code: values.country_code,
                phone_number: values.phone_number,
            };
            const full_phone = formatPhoneFull(phone_parts);
            const current_full = formatPhoneFull(resolvePhoneParts(user));

            const { data: updateData, error: updateAuthError } =
                await supabase.auth.updateUser({
                    ...(values.email && values.email !== user.email
                        ? { email: values.email }
                        : {}),
                    ...(full_phone && full_phone !== current_full
                        ? { phone: full_phone }
                        : {}),
                    data: {
                        ...(user.user_metadata ?? {}),
                        username: values?.full_name,
                        date_of_birth: values?.date_of_birth || null,
                        gender: values?.gender,
                        address: values?.address,
                        phone: values?.phone_number,
                        country_code: values?.country_code,
                    },
                });

            if (updateAuthError) {
                throw updateAuthError;
            }

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                dispatch(setSession({ session }));
            }

            reset(
                buildDefaultValues(session?.user ?? updateData.user ?? user),
            );

            toast.show({
                title: "Account updated",
                placement: "top",
                backgroundColor: "green.800",
            });
            set_edit_mode(false);
        } catch (error: any) {
            toast.show({
                title: error?.message ?? "Failed to update account",
                placement: "top",
                background: "red.800",
            });
        } finally {
            set_saving(false);
        }
    });

    const renderCard = (
        rows: { label: string; value: string; multiline?: boolean }[],
    ) => (
        <View style={styles.card}>
            {rows.map((row, index) => (
                <DetailRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    multiline={row.multiline}
                    is_last={index === rows.length - 1}
                />
            ))}
        </View>
    );


    const render_edit_field = (field: AccountEditFieldConfig) => {
        const field_style =
            field.layout === "phone" ? styles.phone_field : styles.field_spacing;

        switch (field.type) {
            case "phone":
                return (
                    <PhoneNumberField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        control={control}
                        variant="account"
                        type="number"
                        validations={field.validations}
                        on_country_code_select={(code) =>
                            setValue("country_code", code)
                        }
                        default_selected_country={watch("country_code") || "+1"}
                        style={field_style}
                    />
                );
            case "date":
                return (
                    <DateField<AccountFormValues>
                        key={field.name}
                        name={field.name as FieldPath<AccountFormValues>}
                        label={field.label}
                        control={control}
                        validations={field.validations}
                        placeholder={field.placeholder}
                        style={field_style}
                        maximumDate={new Date()}
                        variant="account"
                    />
                );
            case "dropdown":
                return (
                    <DropdownField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        control={control}
                        options={field.options ?? []}
                        validations={field.validations}
                        placeholder={field.placeholder}
                        style={field_style}
                    />
                );
            case "input":
            default:
                return (
                    <InputField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        control={control}
                        variant="account"
                        validations={field.validations}
                        placeholder={field.placeholder}
                        multiline={field.multiline}
                        style={field_style}
                    />
                );
        }
    };

    const render_edit_form = () => (
        <View style={styles.form_card}>
            {ACCOUNT_EDIT_FIELDS?.map(render_edit_field)}
        </View>
    );

    return (
        <SafeAreaView style={styles.safe_area}>
            <Header
                container_style={styles.header_container}
                title={<Text style={styles.header_title}>MY ACCOUNT</Text>}
                left_section={
                    <TouchableOpacity
                        onPress={() =>
                            edit_mode ? exit_edit_mode() : navigation?.goBack()
                        }
                    >
                        <Image
                            source={ImageLinks?.back_arrow}
                            style={{
                                resizeMode: "contain",
                                height: SIZES.height * 0.04,
                            }}
                            alt="back"
                        />
                    </TouchableOpacity>
                }
                right_section={
                    !edit_mode ? (
                        <TouchableOpacity onPress={enter_edit_mode}>
                            <Text style={styles.edit_text}>Edit</Text>
                        </TouchableOpacity>
                    ) : null
                }
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[
                        styles.scroll_content,
                        edit_mode && styles.scroll_content_edit,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {edit_mode ? (
                        render_edit_form()
                    ) : (
                        <>
                            {renderCard(primary)}
                            {renderCard(extended)}
                        </>
                    )}
                </ScrollView>

                {edit_mode && (
                    <View style={styles.action_bar}>
                        <View style={styles.action_button_wrap}>
                            <Button
                                text="Cancel"
                                type="secondary"
                                width="100%"
                                onClick={handle_cancel}
                                style={styles.cancel_button}
                            />
                        </View>
                        <View style={styles.action_button_wrap}>
                            <Button
                                text="Save"
                                type="primary"
                                width="100%"
                                loading={saving}
                                onClick={on_save}
                                style={styles.save_button}
                                activityIndicatorProps={{ color: "#fff" }}
                            />
                        </View>
                    </View>
                )}

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AccountDetails;

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
    edit_text: {
        fontSize: 16,
        fontWeight: "600",
        color: ACCENT,
    },
    scroll: {
        flex: 1,
    },
    scroll_content: {
        paddingHorizontal: 20,
        paddingBottom: 32,
        gap: 16,
    },
    scroll_content_edit: {
        paddingBottom: 16,
    },
    loading_text: {
        textAlign: "center",
        color: "#8a8a8a",
        marginTop: 24,
    },
    card: {
        backgroundColor: "rgb(245, 245, 248)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    form_card: {
        backgroundColor: "rgb(245, 245, 248)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    field_spacing: {
        marginBottom: 8,
    },
    phone_field: {
        width: "100%",
        maxWidth: "100%",
        alignSelf: "stretch",
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingVertical: 20,
        gap: 12,
    },
    row_label: {
        flex: 1,
        fontSize: 15,
        color: "#8a8a8a",
        fontWeight: "400",
    },
    row_value: {
        flex: 1.2,
        fontSize: 15,
        color: "#1a1a1a",
        fontWeight: "400",
        textAlign: "right",
    },
    row_value_multiline: {
        lineHeight: 22,
    },
    row_divider: {
        backgroundColor: "#e6e6e6",
    },
    action_bar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingBottom: 24,
        paddingTop: 8,
    },
    action_button_wrap: {
        flex: 1,
    },
    cancel_button: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        paddingVertical: 12,
    },
    save_button: {
        borderRadius: 10,
        paddingVertical: 12,
    },
});
