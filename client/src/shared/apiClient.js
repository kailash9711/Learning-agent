import axios from "axios";
import { API_BASE_URL } from "./apiPath";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default apiClient;