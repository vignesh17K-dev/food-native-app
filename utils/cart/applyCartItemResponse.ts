import {
  CartItemResponse,
  CartProduct,
  CartProductsMap,
  UpsertCartItemPayload,
} from "../../store/slices/CartSlice";
import type { RestaurantSummary } from "../../types/restaurant";

export type ProductDisplayFields = {
  name?: string;
  price?: number;
  image?: string;
  restaurant_id?: string;
  restaurant?: RestaurantSummary | null;
};

export type ApplyCartItemResponseInput = {
  response: CartItemResponse;
  products: CartProduct[] | CartProductsMap | undefined;
  submittedProductId: string;
  submittedSize?: string | undefined;
  submittedCartItemId?: string | undefined;
  display: ProductDisplayFields;
};

/**
 * Maps a cart item API response into an upsert payload.
 * A new size is added as another cart_item_id under the same product; existing lines are left in place.
 */
export function applyCartItemResponse(
  input: ApplyCartItemResponseInput,
): UpsertCartItemPayload {
  const { response, display } = input;

  return {
    product_id: response.product_id,
    cart_item_id: response.cart_item_id,
    quantity: response.quantity,
    selectedSize: response.selectedSize,
    name: display.name,
    price: display.price,
    image: display.image,
    ...(display.restaurant_id != null
      ? { restaurant_id: display.restaurant_id }
      : {}),
    ...(display.restaurant !== undefined
      ? { restaurant: display.restaurant }
      : {}),
  };
}
