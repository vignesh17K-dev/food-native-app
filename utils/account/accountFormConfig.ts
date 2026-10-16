import type { DropdownOption } from "../../src/components/DropdownField";

export const GENDER_OPTIONS: DropdownOption[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export type AccountEditFieldType = "input" | "phone" | "date" | "dropdown";

export type AccountEditFieldConfig = {
  name: string;
  label: string;
  type: AccountEditFieldType;
  validations?: Record<string, unknown>;
  placeholder?: string;
  multiline?: boolean;
  options?: DropdownOption[];
  /** Wider phone row layout */
  layout?: "default" | "phone";
};

export const ACCOUNT_EDIT_FIELDS: AccountEditFieldConfig[] = [
  {
    name: "full_name",
    label: "Full Name",
    type: "input",
    validations: { required: true },
  },
  {
    name: "phone_number",
    label: "Phone Number",
    type: "phone",
    validations: { required: true, number: true },
    layout: "phone",
  },
  {
    name: "date_of_birth",
    label: "Date of Birth",
    type: "date",
    placeholder: "MM/DD/YYYY",
  },
  {
    name: "gender",
    label: "Gender",
    type: "dropdown",
    options: GENDER_OPTIONS,
    placeholder: "Select gender",
  },
  {
    name: "email",
    label: "Email",
    type: "input",
    validations: { required: true, email: true },
  },
  {
    name: "address",
    label: "Address",
    type: "input",
    multiline: true,
  },
];
