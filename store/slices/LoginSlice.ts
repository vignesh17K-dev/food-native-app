import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LoginState = {
  isLogin: boolean;
  loginType: string;
  is_logged_in_via_google: boolean;
};

const initialState: LoginState = {
  isLogin: false,
  loginType: "signup",
  is_logged_in_via_google: false,
};

const Login = createSlice({
  name: "login",
  initialState,
  reducers: {
    setLogin: (state, { payload }: PayloadAction<boolean>) => {
      state.isLogin = payload;
      if (!payload) {
        state.is_logged_in_via_google = false;
      }
    },
    setLoggedInViaGoogle: (state, { payload }: PayloadAction<boolean>) => {
      state.is_logged_in_via_google = payload;
    },
    changeLoginType: (state, { payload }: PayloadAction<string>) => {
      state.loginType = payload;
    },
  },
});

export const { setLogin, setLoggedInViaGoogle, changeLoginType } = Login.actions;
export default Login.reducer;
