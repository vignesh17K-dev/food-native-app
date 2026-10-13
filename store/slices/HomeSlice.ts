import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type HomeState = {
  section_data: unknown[];
};

const initialState: HomeState = {
  section_data: [],
};

const Home = createSlice({
  name: "home",
  initialState,
  reducers: {
    set_section_data: (state, { payload }: PayloadAction<unknown[]>) => {
      state.section_data = payload;
    },
  },
});

export const { set_section_data } = Home.actions;
export default Home.reducer;
