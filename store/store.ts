import LoginReducer from "./slices/LoginSlice";
import UserReducer from "./slices/User";
import HomeReducer from "./slices/HomeSlice";
import WishlistReducer from "./slices/WishlistSlice";
import SearchReducer from "./slices/SearchSlice";
import CartReducer from "./slices/CartSlice";
import { createStore, combineReducers, applyMiddleware, AnyAction } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { thunk, ThunkDispatch } from "redux-thunk";

const main_reducer = combineReducers({
  login: LoginReducer,
  user: UserReducer,
  home: HomeReducer,
  wishlist: WishlistReducer,
  search: SearchReducer,
  cart: CartReducer,
});

export type RootState = ReturnType<typeof main_reducer>;

const root_reducer = (
  state: RootState | undefined,
  action: AnyAction,
): RootState => {
  if (action.type === "USER_LOGOUT") {
    return main_reducer(undefined, action);
  }
  return main_reducer(state, action);
};

const persist_config = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
};

const middleware = [thunk];

const persistedReducer = persistReducer(persist_config, root_reducer);

export const store = createStore(
  persistedReducer,
  applyMiddleware(...middleware),
);
export const persistor = persistStore(store);

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
