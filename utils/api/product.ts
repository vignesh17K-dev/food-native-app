import utils from "../utils";
import { ProductSearchBody } from "../buildProductFilterParams";

export type RestaurantListParams = {
  search?: string;
  cuisine?: string;
};

const product = {
  get_products: (body: ProductSearchBody = {}) => {
    return utils.api_request({
      url: "api/products",
      method: "POST",
      data: body,
    });
  },
  get_categories: () => {
    return utils.api_request({
      url: "api/products/categories",
      method: "GET",
    });
  },

  get_popular_rails: () => {
    return utils.api_request({
      url: "api/products/popular",
      method: "GET",
    });
  },

  get_menu_rails: () => {
    return utils.api_request({
      url: "api/products/menu_item",
      method: "GET",
    });
  },

  get_product_details: (product_id: string) => {
    return utils.api_request({
      url: `api/products/detail/${product_id}`,
      method: "GET",
    });
  },

  get_category_details: (category_id: string) => {
    return utils.api_request({
      url: `api/products/category/${category_id}`,
      method: "GET",
    });
  },

  get_restaurants: (params?: RestaurantListParams) => {
    return utils.api_request({
      url: "api/products/restaurants",
      method: "GET",
      params,
    });
  },

  get_restaurant: (id: string) => {
    return utils.api_request({
      url: `api/products/restaurants/${id}`,
      method: "GET",
    });
  },
};

export default product;
