import axios from 'axios';
import { store } from '../store/store';
import { get } from 'lodash';


const BASE_URL = 'https://food-app-backend-flame-omega.vercel.app';
const BASE_URL_STAGING = 'https://food-app-backend-git-staging-vignesh17-projects.vercel.app/';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 3800 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const new_state = store.getState();
    const token = get(new_state, 'user.session.session.access_token');
    console.log(token, "token from store exist");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
      config.headers['x-client-id'] = 'WEB';
      config.headers['x-client-version'] = '0.0.1';
      config.headers['x-client-env'] = 'DEV';
    } else {
      console.warn("No access token found, request may fail!");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error);
    } else {
      console.error('Network Error:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
