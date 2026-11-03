export type Restaurant = {
  id: string;
  name: string;
  image: string;
  logo: string;
  cuisine: string[];
  deliveryTime: string;
  deliveryDistance: number;
  rating: number;
  tags: string[];
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
};

export type RestaurantSummary = {
  id: string;
  name: string;
  image: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  deliveryDistance: number;
  cuisine: string[];
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
};

export type LocationWithAddress = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

export type RestaurantDetail = Restaurant & {
  menu: any[];
};
