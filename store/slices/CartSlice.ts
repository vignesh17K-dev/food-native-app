import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types/product";

export type CartProduct = Product & {
  quantity?: number;
  selectedSize?: string;
  cart_item_id?: string;
  product_id?: string;
};

export type CartProductsMap = Record<
  string,
  Record<string, CartProduct>
>;

export type CartData = {
  id?: string;
  _id?: string;
  cart_id?: string;
  user_id?: string;
  products?: CartProduct[] | CartProductsMap;
};

export type CartItemResponse = {
  product_id: string;
  cart_item_id: string;
  quantity: number;
  selectedSize?: string;
};

export type UpsertCartItemPayload = CartItemResponse &
  Partial<Omit<CartProduct, "quantity" | "selectedSize">> & {
    replace_cart_item_id?: string;
  };

type CartState = {
  cart_data: CartData | null;
};

const initialState: CartState = {
  cart_data: null,
};

export function ensureProductsMap(
  products: CartProduct[] | CartProductsMap | undefined,
): CartProductsMap {
  if (!products) {
    return {};
  }

  if (!Array.isArray(products)) {
    return products;
  }

  const map: CartProductsMap = {};
  for (const item of products) {
    const product_id = item.product_id ?? item.id;
    const cart_item_id = item.cart_item_id;
    if (!product_id || !cart_item_id) {
      continue;
    }
    if (!map[product_id]) {
      map[product_id] = {};
    }
    map[product_id][cart_item_id] = item;
  }
  return map;
}

function deleteVariantFromMap(
  products: CartProductsMap,
  product_id: string,
  cart_item_id: string,
): void {
  const variants = products[product_id];
  if (!variants) {
    return;
  }

  delete variants[cart_item_id];
  if (Object.keys(variants).length === 0) {
    delete products[product_id];
  }
}

const CartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    set_cart: (state, { payload }: PayloadAction<CartData>) => {
      state.cart_data = {
        ...payload,
        products: ensureProductsMap(payload.products),
      };
    },
    clear_cart: (state) => {
      state.cart_data = null;
    },
    set_cart_products: (
      state,
      { payload }: PayloadAction<CartProduct[] | CartProductsMap>,
    ) => {
      if (state.cart_data) {
        state.cart_data.products = ensureProductsMap(payload);
      }
    },
    upsert_cart_item: (
      state,
      { payload }: PayloadAction<UpsertCartItemPayload>,
    ) => {
      const {
        product_id,
        cart_item_id,
        quantity,
        selectedSize,
        replace_cart_item_id,
        ...rest
      } = payload;

      if (!product_id || !cart_item_id) {
        return;
      }

      if (!state.cart_data) {
        state.cart_data = { products: {} };
      }

      const products = ensureProductsMap(state.cart_data.products);

      if (
        replace_cart_item_id &&
        replace_cart_item_id !== cart_item_id
      ) {
        deleteVariantFromMap(products, product_id, replace_cart_item_id);
      }

      const existing = products[product_id]?.[cart_item_id];

      products[product_id] = {
        ...products[product_id],
        [cart_item_id]: {
          ...existing,
          ...rest,
          id: product_id,
          product_id,
          cart_item_id,
          quantity,
          selectedSize,
        },
      };

      state.cart_data.products = products;
    },
    remove_cart_item: (
      state,
      {
        payload,
      }: PayloadAction<{ product_id: string; cart_item_id: string }>,
    ) => {
      if (!state.cart_data?.products) {
        return;
      }

      const products = ensureProductsMap(state.cart_data.products);
      deleteVariantFromMap(
        products,
        payload.product_id,
        payload.cart_item_id,
      );
      state.cart_data.products = products;
    },
  },
});

export const {
  set_cart,
  clear_cart,
  set_cart_products,
  upsert_cart_item,
  remove_cart_item,
} = CartSlice.actions;
export default CartSlice.reducer;
