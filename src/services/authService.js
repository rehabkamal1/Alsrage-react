import axios from "axios";
import {
  showRetryableError,
  showValidationErrors,
} from "../utils/swalHelper";

// ─────────────────────────────────────────────
//  Axios instance pointing to Laravel API
// ─────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422 && error.response.data?.errors) {
      showValidationErrors(error.response.data.errors);
    }

    if (
      (error.response?.status >= 500 || !error.response) &&
      error.config &&
      !error.config._manualRetry
    ) {
      const requestConfig = error.config;
      const message = error.response
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

    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────
//  LOGIN
//  1. Check hardcoded admin list first.
//  2. If not admin → forward to Laravel API.
// ─────────────────────────────────────────────
export const loginUser = async (payload) => {
  // Not an admin or just using API for all
  const { data } = await api.post("/login", payload);
  return data;
};

// ─────────────────────────────────────────────
//  REGISTER
//  Roles allowed: supplier, client only.
//  Admin cannot be registered via the form.
// ─────────────────────────────────────────────
export const registerUser = async (payload) => {
  // Guard: block admin role registrations
  if (payload.role === "admin") {
    throw new Error("Admin accounts cannot be created via registration.");
  }
  const { data } = await api.post("/register", payload);
  return data;
};

// ─────────────────────────────────────────────
//  Token & User helpers
// ─────────────────────────────────────────────
// localStorage is accessible to injected scripts; token lifetime is limited server-side.
export const saveToken = (token) => {
  localStorage.setItem("auth_token", token);
};

export const getToken = () => localStorage.getItem("auth_token");

export const saveUser = (user) => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user"));
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null; // "admin" | "supplier" | "client" | null
};
