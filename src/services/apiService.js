import axios from "axios";
import {
  fetchCachedSettings,
  invalidateSettingsCache,
} from "../hooks/useSettings";
import {
  showRetryableError,
  showValidationErrors,
} from "../utils/swalHelper";

const getToken = () => localStorage.getItem("auth_token");
const API_URL = import.meta.env.VITE_API_URL;
const SETTINGS_CACHE_KEYS = {
  "/settings/priority-levels": "settings:priority_levels",
  "/settings/passport-statuses": "settings:passport_statuses",
  "/settings/transfer-statuses": "settings:transfer_statuses",
  "/settings/payment-methods": "settings:payment_methods",
  "/settings/bank-names": "settings:bank_names",
  "/settings/order-statuses": "settings:order_statuses",
  "/settings/order-process-statuses": "settings:order_process_statuses",
  "/settings/service-types": "settings:service_types",
  "/settings/authentication-statuses": "settings:authentication_statuses",
  "/settings/authorization-statuses": "settings:authorization_statuses",
  "/settings/nationalities": "settings:nationalities",
  "/settings/professions": "settings:professions",
  "/settings/arrival-destinations": "settings:arrival_destinations",
};

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

export const fetchAllPages = async (
  fetchPage,
  params = {},
  perPage = 100,
) => {
  const firstResponse = await fetchPage({ ...params, page: 1, per_page: perPage });
  const getPageData = (response) => {
    const data = response.data?.data ?? response.data;
    if (!Array.isArray(data)) {
      throw new Error("Invalid paginated API response: expected an array");
    }
    return data;
  };

  const results = [...getPageData(firstResponse)];
  const lastPage = Number(
    firstResponse.data?.meta?.last_page ??
      firstResponse.data?.last_page ??
      1,
  );

  for (let page = 2; page <= lastPage; page += 1) {
    const response = await fetchPage({ ...params, page, per_page: perPage });
    results.push(...getPageData(response));
  }

  return results;
};

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

api.interceptors.response.use(
  (response) => {
    if (response.config.method?.toLowerCase() !== "get") {
      const requestPath = response.config.url?.split("?")[0];
      for (const [path, cacheKey] of Object.entries(SETTINGS_CACHE_KEYS)) {
        if (requestPath === path || requestPath?.startsWith(`${path}/`)) {
          invalidateSettingsCache(cacheKey);
          break;
        }
      }
    }

    return response;
  },
  async (error) => {
    const status = error.response?.status;

    if (status === 422 && error.response.data?.errors) {
      showValidationErrors(error.response.data.errors);
    }

    if ((status >= 500 || !error.response) && error.config && !error.config._manualRetry) {
      const requestConfig = error.config;
      const message = status >= 500
        ? "حدثت مشكلة في الخادم. يمكنك المحاولة مرة أخرى."
        : "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم أعد المحاولة.";

      return showRetryableError(message, () => {
        requestConfig._manualRetry = true;
        return api.request(requestConfig);
      }).then(
        (response) => response ?? Promise.reject(error),
        () => Promise.reject(error),
      );
    }

    if (status === 401) {
      const requestConfig = error.config;
      const token = getToken();

      if (requestConfig && token && !requestConfig._retry) {
        requestConfig._retry = true;
        return api.request(requestConfig);
      }

      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new CustomEvent("session-expired"));
    }

    return Promise.reject(error);
  },
);

// =============== Clients ===============
export const getClients = (params = {}) => api.get("/clients", { params });
export const createClient = (data) => api.post("/clients", data);
export const updateClient = (id, data) =>
  api.post(`/clients/${id}?_method=PUT`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);
export const searchClients = (query) =>
  api.get(`/clients/search?query=${query}`);
export const quickCreateClient = (data) => api.post("/clients/quick", data);

// =============== Saudi Offices ===============
export const getSaudiOffices = (params = {}) =>
  api.get("/saudi-offices", { params });
export const createSaudiOffice = (data) => api.post("/saudi-offices", data);
export const updateSaudiOffice = (id, data) =>
  api.put(`/saudi-offices/${id}`, data);
export const deleteSaudiOffice = (id) => api.delete(`/saudi-offices/${id}`);

// =============== External Offices ===============
export const getExternalOffices = (params = {}) =>
  api.get("/external-offices", { params });
export const createExternalOffice = (data) =>
  api.post("/external-offices", data);
export const updateExternalOffice = (id, data) =>
  api.put(`/external-offices/${id}`, data);
export const deleteExternalOffice = (id) =>
  api.delete(`/external-offices/${id}`);

// =============== Orders ===============
export const getOrders = (params = {}) => api.get("/orders", { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data, idempotencyKey) =>
  api.post("/orders", data, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
export const updateOrder = (id, data) =>
  api.post(`/orders/${id}?_method=PUT`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const getOrdersWithoutTracking = (params = {}) => {
  return api.get("/orders/without-tracking", {
    params: {
      ...params,
    },
  });
};

// =============== Employees ===============
export const getEmployees = (params = {}) => api.get("/employees", { params });
export const createEmployee = (data) => api.post("/employees", data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// =============== Order Tracking ===============
export const getOrderTracking = (params) =>
  api.get("/order-tracking", { params });
export const getOrderTrackingByOrderId = (orderId) =>
  api.get(`/order-tracking?order_id=${orderId}`);
export const getSingleOrderTracking = (id) => api.get(`/order-tracking/${id}`);
export const createOrderTracking = (data) => api.post("/order-tracking", data);
export const updateOrderTracking = (id, data) =>
  api.post(`/order-tracking/${id}?_method=PUT`, data);
export const deleteOrderTracking = (id) => api.delete(`/order-tracking/${id}`);

// =============== Transactions ===============
export const getTransactions = (params) => api.get("/transactions", { params });
export const getTransaction = (id) => api.get(`/transactions/${id}`);
export const createTransaction = (data, idempotencyKey) =>
  api.post("/transactions", data, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getFinanceSummary = (params) =>
  api.get("/finance/summary", { params });
export const getOrdersByClient = (clientId) =>
  api.get(`/transactions/orders-by-client?client_id=${clientId}`);

// =============== Settings ===============
export const getSettingsPriorityLevels = () =>
  fetchCachedSettings("settings:priority_levels", () => api.get("/settings/priority-levels"));
export const getSettingsPassportStatuses = () =>
  fetchCachedSettings("settings:passport_statuses", () => api.get("/settings/passport-statuses"));
export const getSettingsTransferStatuses = () =>
  fetchCachedSettings("settings:transfer_statuses", () => api.get("/settings/transfer-statuses"));
export const getSettingsPaymentMethods = () =>
  fetchCachedSettings("settings:payment_methods", () => api.get("/settings/payment-methods"));
export const getSettingsBankNames = () =>
  fetchCachedSettings("settings:bank_names", () => api.get("/settings/bank-names"));
export const getSettingsOrderStatuses = () =>
  fetchCachedSettings("settings:order_statuses", () => api.get("/settings/order-statuses"));
export const getSettingsOrderProcessStatuses = () =>
  fetchCachedSettings("settings:order_process_statuses", () => api.get("/settings/order-process-statuses"));
export const getSettingsServiceTypes = () =>
  fetchCachedSettings("settings:service_types", () =>
    api.get("/settings/service-types"),
  );
export const getSettingsAuthenticationStatuses = () =>
  fetchCachedSettings("settings:authentication_statuses", () =>
    api.get("/settings/authentication-statuses"),
  );
export const getSettingsAuthorizationStatuses = () =>
  fetchCachedSettings("settings:authorization_statuses", () =>
    api.get("/settings/authorization-statuses"),
  );

// =============== Settings - Nationalities & Professions ===============
export const getSettingsNationalities = () =>
  fetchCachedSettings("settings:nationalities", () =>
    api.get("/settings/nationalities"),
  );

export const getSettingsProfessions = () =>
  fetchCachedSettings("settings:professions", () =>
    api.get("/settings/professions"),
  );

export const getSettingsArrivalDestinations = () =>
  fetchCachedSettings("settings:arrival_destinations", () =>
    api.get("/settings/arrival-destinations"),
  );

export const updateSettingsNationalities = (data) =>
  api.post("/settings/nationalities", data);

export const updateSettingsProfessions = (data) =>
  api.post("/settings/professions", data);

export const deleteNationality = (id) =>
  api.delete(`/settings/nationalities/${id}`);

export const deleteProfession = (id) =>
  api.delete(`/settings/professions/${id}`);
export const updateSettingsArrivalDestinations = (data) =>
  api.post("/settings/arrival-destinations", data);
export const deleteArrivalDestination = (id) =>
  api.delete(`/settings/arrival-destinations/${id}`);

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
export const updateSettingsOrderStatuses = (data) =>
  api.post("/settings/order-statuses", data);
export const updateSettingsOrderProcessStatuses = (data) =>
  api.post("/settings/order-process-statuses", data);
export const updateSettingsServiceTypes = (data) =>
  api.post("/settings/service-types", data);
export const updateSettingsAuthenticationStatuses = (data) =>
  api.post("/settings/authentication-statuses", data);
export const updateSettingsAuthorizationStatuses = (data) =>
  api.post("/settings/authorization-statuses", data);

export const deletePriorityLevel = (id) =>
  api.delete(`/settings/priority-levels/${id}`);
export const deletePassportStatus = (id) =>
  api.delete(`/settings/passport-statuses/${id}`);
export const deleteTransferStatus = (id) =>
  api.delete(`/settings/transfer-statuses/${id}`);
export const deletePaymentMethod = (id) =>
  api.delete(`/settings/payment-methods/${id}`);
export const deleteBankName = (id) => api.delete(`/settings/bank-names/${id}`);
export const deleteOrderStatus = (id) =>
  api.delete(`/settings/order-statuses/${id}`);
export const deleteOrderProcessStatus = (id) =>
  api.delete(`/settings/order-process-statuses/${id}`);
export const deleteServiceType = (id) =>
  api.delete(`/settings/service-types/${id}`);
export const deleteAuthenticationStatus = (id) =>
  api.delete(`/settings/authentication-statuses/${id}`);
export const deleteAuthorizationStatus = (id) =>
  api.delete(`/settings/authorization-statuses/${id}`);

// =============== Marketing Leads ===============
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

// =============== Attachments ===============
export const uploadAttachment = (trackingId, data) =>
  api.post(`/order-tracking/${trackingId}/attachments`, data);
export const deleteAttachment = (id) => api.delete(`/attachments/${id}`);

// =============== Reports ===============
export const getOrderFollowUpReport = (params) =>
  api.get("/reports/order-follow-up", { params });
export const getCompletedOrdersReport = (params) =>
  api.get("/reports/completed-orders", { params });
export const getOfficesPerformanceReport = (params) =>
  api.get("/reports/offices-performance", { params });
export const getFinancialCollectionsReport = (params) =>
  api.get("/reports/financial-collections", { params });
export const getEmployeesPerformanceReport = (params) =>
  api.get("/reports/employees-performance", { params });

export const getProfile = () => api.get("/me");

export default api;
