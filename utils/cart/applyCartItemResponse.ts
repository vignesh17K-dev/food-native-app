import {
  CartItemResponse,
  CartProduct,
  CartProductsMap,
  UpsertCartItemPayload,
  ensureProductsMap,
} from "../../store/slices/CartSlice";

export type ProductDisplayFields = {
  name?: string;
  price?: number;
  image?: string;
};

export type ApplyCartItemResponseInput = {
  response: CartItemResponse;
  products: CartProduct[] | CartProductsMap | undefined;
  submittedProductId: string;
  submittedSize: string | undefined;
  display: ProductDisplayFields;
};

function getLinesForProduct(
  products: CartProductsMap,
  product_id: string,
): CartProduct[] {
  const variants = products[product_id];
  if (!variants) {
    return [];
  }
  return Object.values(variants);
}

/**
 * Maps a partial cart item API response into an upsert payload, including
 * replace_cart_item_id when a single existing line is being variant-replaced.
 */
export function applyCartItemResponse(
  input: ApplyCartItemResponseInput,
): UpsertCartItemPayload {
  const { response, products, submittedProductId, submittedSize, display } =
    input;

  const map = ensureProductsMap(products);
  const lines = getLinesForProduct(map, submittedProductId);

  let replace_cart_item_id: string | undefined;

  const sameSizeLine = lines.find(
    (line) => line.selectedSize === submittedSize,
  );

  if (sameSizeLine?.cart_item_id) {
    // Case 1: same variant line — upsert only (same cart_item_id expected).
    replace_cart_item_id = undefined;
  } else if (lines.length === 1 && lines[0].cart_item_id) {
    const only = lines[0];
    if (only.selectedSize !== submittedSize) {
      // Case 2: one line for product, size changed — replace that line.
      replace_cart_item_id = only.cart_item_id;
    }
  }
  // Case 3: lines.length === 0 — new product, no replace.
  // Case 4: multiple lines, new size — no replace.

  return {
    product_id: response.product_id,
    cart_item_id: response.cart_item_id,
    quantity: response.quantity,
    selectedSize: response.selectedSize,
    replace_cart_item_id,
    name: display.name,
    price: display.price,
    image: display.image,
  };
}
