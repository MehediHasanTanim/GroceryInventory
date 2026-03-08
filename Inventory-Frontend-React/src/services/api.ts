import axios from 'axios';

const AUTH_URL = 'http://localhost:8003';
const INVENTORY_URL = 'http://localhost:8000';
const SUPPLIER_URL = 'http://localhost:8001';
const SALES_URL = 'http://localhost:8002';

export const authApi = axios.create({
  baseURL: AUTH_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const inventoryApi = axios.create({
  baseURL: INVENTORY_URL,
});

export const supplierApi = axios.create({
  baseURL: SUPPLIER_URL,
});

export const salesApi = axios.create({
  baseURL: SALES_URL,
});

// Interceptor to add token
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(addAuthToken);
inventoryApi.interceptors.request.use(addAuthToken);
supplierApi.interceptors.request.use(addAuthToken);
salesApi.interceptors.request.use(addAuthToken);
