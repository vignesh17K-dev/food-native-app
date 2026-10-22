import type { Dispatch } from "@reduxjs/toolkit";
import cart from "../api/cart";
import { set_cart } from "../../store/slices/CartSlice";

export async function initializeUserCart(
  dispatch: Dispatch,
  user_id?: string | null,
) {
  if (!user_id) {
    return;
  }

  try {
    const response = await cart.initialize_cart({ user_id });
    const cart_data = response?.data ?? response;
    if (cart_data) {
      dispatch(set_cart(cart_data));
    }
  } catch (error) {
    console.error("Initialize Cart Error:", error);
  }
}
