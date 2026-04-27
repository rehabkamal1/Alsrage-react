import axios from "axios";

const getToken = () => localStorage.getItem("auth_token");
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export const getClients = () => api.get("/clients");
export const createClient = (data) => api.post("/clients", data);
export const updateClient = (id, data) =>
  api.post(`/clients/${id}?_method=PUT`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);
export const searchClients = (query) =>
  api.get(`/clients/search?query=${query}`);
export const quickCreateClient = (data) => api.post("/clients/quick", data);

export const getSaudiOffices = () => api.get("/saudi-offices");
export const createSaudiOffice = (data) => api.post("/saudi-offices", data);
export const updateSaudiOffice = (id, data) =>
  api.put(`/saudi-offices/${id}`, data);
export const deleteSaudiOffice = (id) => api.delete(`/saudi-offices/${id}`);

export const getExternalOffices = () => api.get("/external-offices");
export const createExternalOffice = (data) =>
  api.post("/external-offices", data);
export const updateExternalOffice = (id, data) =>
  api.put(`/external-offices/${id}`, data);
export const deleteExternalOffice = (id) =>
  api.delete(`/external-offices/${id}`);

export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post("/orders", data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export const getEmployees = () => api.get("/employees");
export const createEmployee = (data) => api.post("/employees", data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export const getOrderTracking = (params) =>
  api.get("/order-tracking", { params });
export const getOrderTrackingByOrderId = (orderId) =>
  api.get(`/order-tracking?order_id=${orderId}`);
export const getSingleOrderTracking = (id) => api.get(`/order-tracking/${id}`);
export const createOrderTracking = (data) => api.post("/order-tracking", data);
export const updateOrderTracking = (id, data) =>
  api.put(`/order-tracking/${id}`, data);
export const deleteOrderTracking = (id) => api.delete(`/order-tracking/${id}`);

export const getTransactions = (params) => api.get("/transactions", { params });
export const getTransaction = (id) => api.get(`/transactions/${id}`);
export const createTransaction = (data) => api.post("/transactions", data);
export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getFinanceSummary = (params) =>
  api.get("/finance/summary", { params });

export default api;
