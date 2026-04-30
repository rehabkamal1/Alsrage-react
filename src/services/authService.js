import axios from "axios";

// ─────────────────────────────────────────────
//  HARDCODED ADMIN ACCOUNTS
//  Admin data lives here in the app — no one
//  can register as admin from the UI.
// ─────────────────────────────────────────────
const ADMIN_ACCOUNTS = [
  {
    id: 1,
    name: "Super Admin",
    email: "admin@alsrage.com",
    password: "admin@1234",
    role: "admin",
  },
  // Add more admins here if needed:
  { id: 2, name: "Admin Two", email: "admin2@alsrage.com", password: "admin@1234", role: "admin" },
];

// ─────────────────────────────────────────────
//  Axios instance pointing to Laravel API
// ─────────────────────────────────────────────
const api = axios.create({
  baseURL: "https://alserage.alfanar-rec.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

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
