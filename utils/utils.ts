import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig, Method } from "axios";
import axiosInstance from "./axios";

interface ApiRequestProps {
  url: string;
  method: Method | string;
  data?: unknown;
  params?: AxiosRequestConfig["params"];
}

const utils = {
  store_data: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log("Data stored successfully");
    } catch (error) {
      console.error("Error storing data:", error);
    }
  },

  retrieve_data: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  },

  api_request: async ({ url, method, data, params }: ApiRequestProps) => {
    try {
      const response = await axiosInstance({
        method,
        url,
        data,
        params,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data || error.message);
        throw error.response?.data || error.message;
      }
      console.error("API Error:", error);
      throw error;
    }
  },
};

export default utils;
