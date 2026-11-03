import type { RestaurantSummary } from "../../types/restaurant";

export type CartLineItem = {
  product_id: string;
  cart_item_id: string;
  id?: string;
  name?: string;
  image?: string;
  price?: number;
  quantity?: number;
  selectedSize?: string;
  restaurant_id?: string;
  restaurant?: RestaurantSummary | null;
  products?: CartProductsMap;
};

export type CartProductsMap = Record<
  string,
  Record<string, Omit<CartLineItem, "product_id" | "cart_item_id">>
>;

export const flattenCartProducts = (
  products: CartProductsMap | CartLineItem[] | null | undefined,
): CartLineItem[] => {
  if (!products) {
    return [];
  }

  if (Array.isArray(products)) {
    return products;
  }

  return Object.entries(products).flatMap(([product_id, variants]) => {
    if (!variants || typeof variants !== "object") {
      return [];
    }

    return Object.entries(variants).map(([cart_item_id, item]) => ({
      product_id,
      cart_item_id,
      ...item,
    }));
  });
};
