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

export const getSettingsPriorityLevels = () =>
  api.get("/settings/priority-levels");
export const getSettingsPassportStatuses = () =>
  api.get("/settings/passport-statuses");
export const getSettingsTransferStatuses = () =>
  api.get("/settings/transfer-statuses");
export const getSettingsPaymentMethods = () =>
  api.get("/settings/payment-methods");
export const getSettingsBankNames = () => api.get("/settings/bank-names");
export const getSettingsMarketingStatuses = () =>
  api.get("/settings/marketing-statuses");

export const updateSettingsPriorityLevels = (data) =>
  api.post("/settings/priority-levels", data);
export const updateSettingsPassportStatuses = (data) =>
  api.post("/settings/passport-statuses", data);
export const updateSettingsTransferStatuses = (data) =>
  api.post("/settings/transfer-statuses", data);
export const updateSettingsPaymentMethods = (data) =>
  api.post("/settings/payment-methods", data);
export const updateSettingsBankNames = (data) =>
  api.post("/settings/bank-names", data);
export const updateSettingsMarketingStatuses = (data) =>
  api.post("/settings/marketing-statuses", data);

export const deletePriorityLevel = (id) =>
  api.delete(`/settings/priority-levels/${id}`);
export const deletePassportStatus = (id) =>
  api.delete(`/settings/passport-statuses/${id}`);
export const deleteTransferStatus = (id) =>
  api.delete(`/settings/transfer-statuses/${id}`);
export const deletePaymentMethod = (id) =>
  api.delete(`/settings/payment-methods/${id}`);
export const deleteBankName = (id) => api.delete(`/settings/bank-names/${id}`);
export const deleteMarketingStatus = (id) =>
  api.delete(`/settings/marketing-statuses/${id}`);

export const getMarketingLeads = (params) =>
  api.get("/marketing-leads", { params });
export const getMarketingLead = (id) => api.get(`/marketing-leads/${id}`);
export const createMarketingLead = (data) => api.post("/marketing-leads", data);
export const updateMarketingLead = (id, data) =>
  api.put(`/marketing-leads/${id}`, data);
export const deleteMarketingLead = (id) => api.delete(`/marketing-leads/${id}`);

export const getMarketingSaudiOffices = () =>
  api.get("/marketing-leads/saudi-offices");
export const getMarketingExternalOffices = () =>
  api.get("/marketing-leads/external-offices");
export const getMarketingServiceOffices = () =>
  api.get("/marketing-leads/service-offices");
export const getMarketingStatuses = () => api.get("/marketing-leads/statuses");
export const getMarketingPriorityLevels = () =>
  api.get("/marketing-leads/priority-levels");

export const createMarketingSaudiOffice = (data) =>
  api.post("/marketing-leads/saudi-office", data);
export const createMarketingExternalOffice = (data) =>
  api.post("/marketing-leads/external-office", data);
export const createMarketingServiceOffice = (data) =>
  api.post("/marketing-leads/service-office", data);

export const uploadAttachment = (trackingId, data) =>
  api.post(`/order-tracking/${trackingId}/attachments`, data);
export const deleteAttachment = (id) => api.delete(`/attachments/${id}`);

export default api;
