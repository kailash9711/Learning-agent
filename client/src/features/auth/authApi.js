import apiClient from "../../shared/apiClient";
import { API_PATHS } from "../../shared/apiPath";

export const loginApi = async (payload) => {
  const { data } = await apiClient.post(API_PATHS.AUTH.LOGIN, payload);
  return data;
};

export const signupApi = async (payload) => {
  const { data } = await apiClient.post(API_PATHS.AUTH.REGISTER, payload);
  return data;
};

export const getUserApi = async () => {
  const { data } = await apiClient.get(API_PATHS.AUTH.USER);
  return data;
};

export const logoutApi = async () => {
  const { data } = await apiClient.post(API_PATHS.AUTH.LOGOUT);
  return data;
};