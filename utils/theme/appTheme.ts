import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

export const ACCENT = "#ed7550";

export type AppColorScheme = {
  background: string;
  surface: string;
  surfaceElevated: string;
  inputMuted: string;
  searchBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  accentSoft: string;
  placeholder: string;
  icon: string;
  /** Text inside input fields (white fill in dark mode) */
  fieldText: string;
  fieldPlaceholder: string;
  fieldLabel: string;
};

export const lightAppColors: AppColorScheme = {
  background: "#ffffff",
  surface: "rgb(245, 245, 248)",
  surfaceElevated: "#ffffff",
  inputMuted: "rgb(211, 211, 211)",
  searchBackground: "#f5f5f5",
  text: "#1a1a1a",
  textSecondary: "#8a8a8a",
  border: "#e8e8e8",
  accentSoft: "#fff3ee",
  placeholder: "#b0b0b0",
  icon: "#1a1a1a",
  fieldText: "#1a1a1a",
  fieldPlaceholder: "#b0b0b0",
  fieldLabel: "#8a8a8a",
};

export const darkAppColors: AppColorScheme = {
  background: "#121212",
  surface: "#1c1c1e",
  surfaceElevated: "#ffffff",
  inputMuted: "#ffffff",
  searchBackground: "#2c2c2e",
  text: "#f5f5f5",
  textSecondary: "#a0a0a0",
  border: "#e0e0e0",
  accentSoft: "#3d2a24",
  placeholder: "#8e8e93",
  icon: "#f5f5f5",
  fieldText: "#1a1a1a",
  fieldPlaceholder: "#8a8a8a",
  fieldLabel: "#ffffff",
};

export const navigationLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ACCENT,
    background: lightAppColors.background,
    card: lightAppColors.background,
    text: lightAppColors.text,
    border: lightAppColors.border,
  },
};

export const navigationDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ACCENT,
    background: darkAppColors.background,
    card: darkAppColors.background,
    text: darkAppColors.text,
    border: darkAppColors.border,
  },
};
