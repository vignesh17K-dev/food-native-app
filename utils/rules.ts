import type { RegisterOptions } from "react-hook-form";

const onlyDigitsRegex = /^\d+$/;
const onlyCharactersRegex = /^[A-Za-z]+$/;

type ApplyValidationsProps = {
  character?: boolean | string;
  required?: boolean;
  email?: boolean;
  label?: string;
  maxLength?: number;
  minLength?: number;
  name?: string;
  number?: boolean | string;
  value?: string;
};

const apply_validations = ({
  character,
  required,
  email,
  label,
  maxLength,
  minLength,
  number,
  name,
}: ApplyValidationsProps): RegisterOptions => {
  const rules: RegisterOptions = {};

  if (required) {
    rules.required = `${label || name} is required`;
  }

  if (character) {
    rules.pattern = {
      value: onlyCharactersRegex,
      message: "This field should have only characters are allowed",
    };
  }

  if (number) {
    rules.pattern = {
      value: onlyDigitsRegex,
      message: "This field should have only digits are allowed",
    };
  }

  const validate: RegisterOptions["validate"] = {};

  if (email) {
    validate.matchPattern = (v) =>
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
      "Email must be a valid address";
  }

  if (maxLength) {
    validate.maxLength = (v) =>
      v.length <= maxLength ||
      `This field should have at most ${maxLength} ${
        number ? "digits" : "characters"
      }`;
  }

  if (minLength) {
    validate.minLength = (v) =>
      v.length >= minLength ||
      `This field should have at least ${minLength} ${
        number ? "digits" : "characters"
      }`;
  }

  if (Object.keys(validate).length > 0) {
    rules.validate = validate;
  }

  return rules;
};

export default apply_validations;
