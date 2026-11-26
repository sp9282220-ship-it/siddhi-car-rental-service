import axios from "axios";
import siteConfig from "../config/siteConfig";

export const AUTH_STORAGE_KEY = "siddhi_auth";

const api = axios.create({ baseURL: siteConfig.apiBaseUrl, timeout: 15000 });

// attach the login token (if any) to every request
api.interceptors.request.use((config) => {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
    if (saved?.token) config.headers.Authorization = `Bearer ${saved.token}`;
  } catch { /* ignore broken storage */ }
  return config;
});

// token expired / invalid -> tell AuthContext to log the user out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && err.config?.headers?.Authorization) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(err);
  }
);

/** Turns any API error into a readable sentence for the user. */
export const errorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (!err.response) return "Cannot reach the server. Please make sure the backend is running on port 8080.";
  return err.response.data?.message || fallback;
};
/** Field errors from the backend, e.g. { phone: "Enter a valid 10-digit mobile number" } */
export const fieldErrors = (err) => err.response?.data?.errors || {};

// ---------- Auth & profile ----------
export const registerUser = (data) => api.post("/api/auth/register", data);
export const loginUser = (data) => api.post("/api/auth/login", data);
export const logoutUser = () => api.post("/api/auth/logout");
export const getMe = () => api.get("/api/auth/me");
export const updateProfile = (data) => api.put("/api/users/me", data);
export const changePassword = (data) => api.put("/api/users/me/password", data);

// ---------- Cars ----------
export const getCars = (availableOnly = false) => api.get("/api/cars", { params: availableOnly ? { available: true } : {} });
export const getCar = (id) => api.get(`/api/cars/${id}`);
export const addCar = (data) => api.post("/api/cars", data);
export const updateCar = (id, data) => api.put(`/api/cars/${id}`, data);
export const deleteCar = (id) => api.delete(`/api/cars/${id}`);

// ---------- Bookings ----------
export const createBooking = (data) => api.post("/api/bookings", data);
export const getAllBookings = (status) => api.get("/api/bookings", { params: status ? { status } : {} });
export const getMyBookings = () => api.get("/api/bookings/my");
export const getBooking = (id) => api.get(`/api/bookings/${id}`);
export const trackBooking = (id, email) => api.get("/api/bookings/track", { params: { id, email } });
export const updateBookingStatus = (id, status, adminRemarks) => api.put(`/api/bookings/${id}/status`, { status, adminRemarks });
export const cancelBooking = (id) => api.put(`/api/bookings/${id}/cancel`);

// ---------- Contact ----------
export const sendContactMessage = (data) => api.post("/api/contact", data);
export const getContactMessages = () => api.get("/api/contact");
export const markMessageRead = (id, read) => api.put(`/api/contact/${id}/read`, null, { params: { read } });
export const deleteMessage = (id) => api.delete(`/api/contact/${id}`);

// ---------- Testimonials ----------
export const getTestimonials = () => api.get("/api/testimonials");
export const submitTestimonial = (data) => api.post("/api/testimonials", data);
export const getAllTestimonials = () => api.get("/api/testimonials/all");
export const setTestimonialApproval = (id, approved) => api.put(`/api/testimonials/${id}/approval`, { approved });
export const deleteTestimonial = (id) => api.delete(`/api/testimonials/${id}`);

// ---------- Admin ----------
export const getDashboardStats = () => api.get("/api/admin/dashboard");
export const getCustomers = () => api.get("/api/admin/customers");

export default api;
