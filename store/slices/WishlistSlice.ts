import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { filter, find } from "lodash";
import type { Product } from "../../types/product";

type WishlistState = {
  wishlist_data: Product[];
};

const initialState: WishlistState = {
  wishlist_data: [],
};

const Wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    set_wishlist: (state, action: PayloadAction<Product[]>) => {
      state.wishlist_data = action.payload;
    },

    update_wishlist: (state, action: PayloadAction<Product>) => {
      const product_data = action.payload;
      const product_id_exist = find(
        state.wishlist_data,
        (item) => item.id === product_data.id,
      );
      if (product_id_exist) {
        state.wishlist_data = filter(
          state.wishlist_data,
          (item) => item.id !== product_data.id,
        );
      } else {
        state.wishlist_data = [...state.wishlist_data, product_data];
      }
    },

    add_to_wishlist: (state, action: PayloadAction<Product>) => {
      state.wishlist_data.push(action.payload);
    },

    remove_from_wishlist: (state, action: PayloadAction<string>) => {
      const product_id = action.payload;
      state.wishlist_data = filter(
        state.wishlist_data,
        (item) => item.id !== product_id,
      );
    },
  },
});

export const {
  set_wishlist,
  add_to_wishlist,
  remove_from_wishlist,
  update_wishlist,
} = Wishlist.actions;
export default Wishlist.reducer;
