import { flatMap } from "lodash";
import type {
  LocationWithAddress,
  RestaurantSummary,
} from "../../types/restaurant";

type CartLineWithRestaurant = {
  restaurant?: RestaurantSummary | null;
  restaurant_id?: string;
  image?: string;
};

function flattenCartProducts(products: unknown): CartLineWithRestaurant[] {
  if (!products) {
    return [];
  }

  if (Array.isArray(products)) {
    return products;
  }

  return flatMap(products as Record<string, unknown>, (product_data: any) =>
    flatMap(product_data, (item: any) => item),
  );
}

/** First cart line item that has restaurant data. */
export function getFirstRestaurant(
  products: unknown,
): RestaurantSummary | null {
  const flattened = flattenCartProducts(products);
  const withRestaurant = flattened.find((item) => item?.restaurant);
  return withRestaurant?.restaurant ?? null;
}

/** Restaurant logo URL from the first cart line, if present. */
export function getFirstRestaurantLogo(
  products: unknown,
): string | undefined {
  const logo = getFirstRestaurant(products)?.logo;
  if (typeof logo === "string" && logo.length > 0) {
    return logo;
  }
  return undefined;
}

/** Restaurant pin from the first cart line that has address + coordinates. */
export function getFirstRestaurantLocation(
  products: unknown,
): LocationWithAddress | null {
  const restaurant = getFirstRestaurant(products);
  if (
    !restaurant ||
    typeof restaurant.formattedAddress !== "string" ||
    restaurant.formattedAddress.length === 0 ||
    typeof restaurant.latitude !== "number" ||
    typeof restaurant.longitude !== "number"
  ) {
    return null;
  }

  return {
    formattedAddress: restaurant.formattedAddress,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
  };
}
