import { useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import {
  AppColorScheme,
  darkAppColors,
  lightAppColors,
} from "../../utils/theme/appTheme";

export function useAppTheme() {
  const darkMode = useAppSelector((state) => state.preferences.darkMode);
  const colors: AppColorScheme = darkMode ? darkAppColors : lightAppColors;

  const layout = useMemo(
    () => ({
      screen: { flex: 1 as const, backgroundColor: colors.background },
      surface: { backgroundColor: colors.surface },
      surfaceCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
      },
      elevated: { backgroundColor: colors.surfaceElevated },
      text: { color: colors.text },
      textSecondary: { color: colors.textSecondary },
    }),
    [colors],
  );

  return {
    darkMode,
    colors,
    layout,
  };
}
