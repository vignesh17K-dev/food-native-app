const onlyDigitsRegex = /^\d+$/;
const onlyCharactersRegex = /^[A-Za-z]+$/;

type ValidationRules = {
  required?: string | boolean;
  pattern?: {
    value?: RegExp;
    message?: string;
  };
  validate?: Record<string, (v: string) => true | string>;
};

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
}: ApplyValidationsProps): ValidationRules => {
  let rules: ValidationRules = {
    validate: {},
    pattern: {},
  };

  if (required) {
    rules = {
      ...rules,
      required: `${label || name} is required`,
    };
  } else {
    rules = {
      ...rules,
      required: false,
    };
  }

  if (character) {
    rules = {
      ...rules,
      pattern: {
        ...rules.pattern,
        value: onlyCharactersRegex,
        message: "This field should have only characters are allowed",
      },
    };
  }

  if (number) {
    rules = {
      ...rules,
      pattern: {
        ...rules.pattern,
        value: onlyDigitsRegex,
        message: "This field should have only digits are allowed",
      },
    };
  }

  if (email) {
    rules = {
      ...rules,
      validate: {
        ...rules.validate,
        matchPattern: (v) =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "Email must be a valid address",
      },
    };
  }

  if (maxLength) {
    rules = {
      ...rules,
      validate: {
        ...rules.validate,
        maxLength: (v) =>
          v.length <= maxLength ||
          `This field should have at most ${maxLength} ${
            number ? "digits" : "characters"
          }`,
      },
    };
  }

  if (minLength) {
    rules = {
      ...rules,
      validate: {
        ...rules.validate,
        minLength: (v) =>
          v.length >= minLength ||
          `This field should have at least ${minLength} ${
            number ? "digits" : "characters"
          }`,
      },
    };
  }

  return rules;
};

export default apply_validations;
