import axios from 'axios';
import { getToken } from './authService';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clients
export const getClients = () => api.get('/clients');
export const createClient = (data) => api.post('/clients', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);

// Saudi Offices
export const getSaudiOffices = () => api.get('/saudi-offices');
export const createSaudiOffice = (data) => api.post('/saudi-offices', data);
export const updateSaudiOffice = (id, data) => api.put(`/saudi-offices/${id}`, data);
export const deleteSaudiOffice = (id) => api.delete(`/saudi-offices/${id}`);

// External Offices
export const getExternalOffices = () => api.get('/external-offices');
export const createExternalOffice = (data) => api.post('/external-offices', data);
export const updateExternalOffice = (id, data) => api.put(`/external-offices/${id}`, data);
export const deleteExternalOffice = (id) => api.delete(`/external-offices/${id}`);

// Orders
export const getOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Employees
export const getEmployees = () => api.get('/employees');
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export default api;
