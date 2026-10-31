import type { RestaurantSummary } from "./restaurant";

export type Product = {
  id: string;
  name: string;
  description?: string;
  categories?: string[];
  price: number;
  calories?: number;
  isFavorite?: boolean;
  image?: string;
  deliveryTime?: string;
  deliveryDistance?: number;
  tags?: string[];
  rating?: number;
  restaurant_id?: string;
  restaurant?: RestaurantSummary | null;
};

export type Category = {
  id: string;
  name: string;
  image?: string;
  [key: string]: unknown;
};
