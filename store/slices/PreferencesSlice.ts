import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PreferencesState = {
  darkMode: boolean;
};

const initialState: PreferencesState = {
  darkMode: false,
};

const PreferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setDarkMode: (state, { payload }: PayloadAction<boolean>) => {
      state.darkMode = payload;
    },
  },
});

export const { setDarkMode } = PreferencesSlice.actions;
export default PreferencesSlice.reducer;
