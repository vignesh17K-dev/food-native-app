import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Session } from "@supabase/supabase-js";

export type UserSessionState = {
  session: Session | null;
};

type UserState = {
  session: UserSessionState | Record<string, never>;
};

const initialState: UserState = {
  session: {},
};

const User = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSession: (state, { payload }: PayloadAction<UserSessionState>) => {
      state.session = payload;
    },
  },
});

export const { setSession } = User.actions;
export default User.reducer;
