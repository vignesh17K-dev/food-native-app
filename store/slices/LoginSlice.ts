import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LoginState = {
  isLogin: boolean;
  loginType: string;
};

const initialState: LoginState = {
  isLogin: false,
  loginType: "signup",
};

const Login = createSlice({
  name: "login",
  initialState,
  reducers: {
    setLogin: (state, { payload }: PayloadAction<boolean>) => {
      state.isLogin = payload;
    },
    changeLoginType: (state, { payload }: PayloadAction<string>) => {
      state.loginType = payload;
    },
  },
});

export const { setLogin, changeLoginType } = Login.actions;
export default Login.reducer;
