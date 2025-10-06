import axios from 'axios';
import { store } from '../store/store';
import { logoutUser } from '../store/authSlice';
const baseURL = process.env.NEXT_PUBLIC_API_URL;;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${baseURL}/auth/refresh-token`, {}, {
          withCredentials: true,
        });
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;