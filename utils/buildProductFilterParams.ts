import constants from "./constants";
import { FilterValues } from "../src/screens/Home/components/FilterModal";

export type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  maxDeliveryTime?: number;
  maxDistance?: number;
  tags?: string[];
  restaurant_id?: string;
};

export type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export const PRODUCT_PAGE_LIMIT = 10;

export type ProductSearchBody = {
  search?: string;
  page?: number;
  limit?: number;
  filters?: ProductFilters;
};

type BuildProductSearchOptions = {
  filters?: FilterValues | null;
  search?: string;
  page?: number;
  limit?: number;
};

const buildProductFilters = (
  filters: FilterValues | null | undefined
): ProductFilters => {
  const result: ProductFilters = {};

  if (!filters) {
    return result;
  }

  if (filters.priceMin > 0) {
    result.minPrice = filters.priceMin;
  }
  if (filters.priceMax < 100) {
    result.maxPrice = filters.priceMax;
  }

  if (filters.rating !== null) {
    const rating = constants.ratings.find((item) => item.id === filters.rating);
    if (rating) {
      result.rating = rating.label;
    }
  }

  if (filters.deliveryTime !== null) {
    const delivery = constants.delivery_time.find(
      (item) => item.id === filters.deliveryTime
    );
    if (delivery) {
      result.maxDeliveryTime = delivery.minutes;
    }
  }

  if (filters.distanceMax < 20) {
    result.maxDistance = filters.distanceMax;
  }

  if (filters.tags.length > 0) {
    const tagSlugs = filters.tags
      .map((id) => constants.tags.find((tag) => tag.id === id)?.slug)
      .filter((slug): slug is string => Boolean(slug));

    if (tagSlugs.length > 0) {
      result.tags = tagSlugs;
    }
  }

  if (filters.restaurantId) {
    result.restaurant_id = filters.restaurantId;
  }

  return result;
};

export const buildProductSearchBody = ({
  filters,
  search,
  page = 1,
  limit = PRODUCT_PAGE_LIMIT,
}: BuildProductSearchOptions): ProductSearchBody => {
  const body: ProductSearchBody = {
    page,
    limit,
  };

  if (search?.trim()) {
    body.search = search.trim();
  }

  const filterParams = buildProductFilters(filters);
  if (Object.keys(filterParams).length > 0) {
    body.filters = filterParams;
  }

  return body;
};

export const hasActiveFilters = (filters: FilterValues | null): boolean => {
  if (!filters) {
    return false;
  }

  return (
    filters.priceMin > 0 ||
    filters.priceMax < 100 ||
    filters.rating !== null ||
    filters.deliveryTime !== null ||
    filters.distanceMin > 0 ||
    filters.distanceMax < 20 ||
    filters.tags.length > 0 ||
    Boolean(filters.restaurantId)
  );
};
