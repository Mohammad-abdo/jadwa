// API service for connecting frontend to backend
import { getCookie, setCookie, removeCookie } from "../utils/cookies.js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://app.econolysis.sa:5000/api";

// Helper function to get auth token from cookies
const getAuthToken = () => {
  return getCookie("accessToken");
};

// Helper function to set auth token in cookies
const setAuthToken = (token) => {
  setCookie("accessToken", token, 7); // 7 days
};

// Helper function to remove auth token from cookies
const removeAuthToken = () => {
  removeCookie("accessToken");
  removeCookie("refreshToken");
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle connection errors
    if (!response) {
      throw new Error(
        "Cannot connect to server. Please make sure the backend server is running on https://jadwa.developteam.site"
      );
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));

      // Handle 401 Unauthorized - only clear tokens, don't redirect automatically
      // Let the calling component handle the redirect if needed
      if (response.status === 401) {
        removeAuthToken();
        // Only redirect if we're in a protected route
        const isProtectedRoute =
          window.location.pathname.startsWith("/admin") ||
          window.location.pathname.startsWith("/client") ||
          window.location.pathname.startsWith("/consultant");
        if (isProtectedRoute && window.location.pathname !== "/login") {
          // Use a flag to prevent multiple redirects
          if (!sessionStorage.getItem("redirecting")) {
            sessionStorage.setItem("redirecting", "true");
            setTimeout(() => {
              sessionStorage.removeItem("redirecting");
              window.location.href = "/login";
            }, 100);
          }
        }
      }

      // Don't throw for 401 if we're already handling it
      if (response.status !== 401) {
        const err = new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
        err.status = response.status; // Preserve status code
        err.response = { status: response.status }; // Preserve response for compatibility
        throw err;
      } else {
        const err = new Error(
          error.error || "Unauthorized. Please login again."
        );
        err.status = 401;
        err.response = { status: 401 };
        throw err;
      }
    }

    return await response.json();
  } catch (error) {
    // Suppress logging for expected authorization errors (403/404)
    // These are handled gracefully by the components and don't need console spam
    const isExpectedAuthError =
      error.message?.includes("Access denied") ||
      error.message?.includes("not found") ||
      error.message?.includes("Session not found") ||
      error.message?.includes("Booking not found") ||
      error.status === 404 ||
      error.response?.status === 404 ||
      error.message?.includes("403") ||
      error.message?.includes("404");

    // Only log unexpected errors, and only in development for 404s
    if (!isExpectedAuthError) {
      console.error("API Error:", error);
    } else if (import.meta.env.DEV && (error.status === 404 || error.response?.status === 404)) {
      // In development, show 404s as warnings (less noisy than errors)
      console.warn("API 404 (expected):", endpoint, error.message);
    }

    // Provide helpful error message for connection errors
    // Don't redirect on connection errors - just show the error
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("ERR_CONNECTION_REFUSED") ||
      error.name === "TypeError"
    ) {
      const helpfulError = new Error(
        "Cannot connect to backend server. Please:\n" +
          "1. Make sure the backend server is running (npm run dev in backend folder)\n" +
          "2. Check that the server is running on https://jadwa.developteam.site\n" +
          "3. Verify your .env file is configured correctly"
      );
      helpfulError.name = "ConnectionError";
      throw helpfulError;
    }

    // Re-throw the error but don't redirect automatically
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => apiRequest("/auth/profile"),

  updateProfile: (data) =>
    apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiRequest("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Client API
export const clientAPI = {
  getDashboardStats: () => apiRequest("/client/dashboard/stats"),
  getBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/client/bookings${queryString ? `?${queryString}` : ""}`
    );
  },
  getConsultations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/client/consultations${queryString ? `?${queryString}` : ""}`
    );
  },
};

// Consultant API
export const consultantAPI = {
  getEarnings: () => apiRequest("/consultants/earnings"),
  getDashboardStats: () => apiRequest("/consultants/dashboard/stats"),
  getConsultants: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/consultants${queryString ? `?${queryString}` : ""}`);
  },
  getConsultantById: (id) => apiRequest(`/consultants/${id}`),
  getAvailability: (id, date) =>
    apiRequest(`/consultants/${id}/availability${date ? `?date=${date}` : ""}`),
  updateProfile: (data) =>
    apiRequest("/consultants/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  requestWithdrawal: (data) =>
    apiRequest("/consultants/withdrawals/request", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  setAvailability: (slots) =>
    apiRequest("/consultants/availability", {
      method: "PUT",
      body: JSON.stringify({ slots }),
    }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => apiRequest("/admin/dashboard/stats"),
  getClients: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/clients${queryString ? `?${queryString}` : ""}`);
  },
  getConsultants: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/admin/consultants${queryString ? `?${queryString}` : ""}`
    );
  },
  getBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/bookings${queryString ? `?${queryString}` : ""}`);
  },
  updateBooking: (id, data) =>
    apiRequest(`/admin/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBooking: (id) =>
    apiRequest(`/admin/bookings/${id}`, {
      method: "DELETE",
    }),
  createClient: (data) =>
    apiRequest("/admin/clients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateClient: (id, data) =>
    apiRequest(`/admin/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteClient: (id) =>
    apiRequest(`/admin/clients/${id}`, {
      method: "DELETE",
    }),
  createConsultant: (data) =>
    apiRequest("/admin/consultants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateConsultant: (id, data) =>
    apiRequest(`/admin/consultants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteConsultant: (id) =>
    apiRequest(`/admin/consultants/${id}`, {
      method: "DELETE",
    }),
  getPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/payments${queryString ? `?${queryString}` : ""}`);
  },
  getReports: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/reports${queryString ? `?${queryString}` : ""}`);
  },
  reviewConsultant: (id, action) =>
    apiRequest(`/admin/consultants/${id}/review`, {
      method: "PUT",
      body: JSON.stringify({ action }),
    }),
  toggleUserStatus: (userId, isActive) =>
    apiRequest(`/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    }),
  resetUserPassword: (userId, newPassword) =>
    apiRequest(`/admin/users/${userId}/reset-password`, {
      method: "PUT",
      body: JSON.stringify({ newPassword }),
    }),
  // Client detail endpoints
  getClientById: (id) => apiRequest(`/admin/clients/${id}`),
  getClientBookings: (id) => apiRequest(`/admin/clients/${id}/bookings`),
  getClientPayments: (id) => apiRequest(`/admin/clients/${id}/payments`),
  getClientReports: (id) => apiRequest(`/admin/clients/${id}/reports`),
  sendProfitToClient: (id, amount, notes) =>
    apiRequest(`/admin/clients/${id}/profit`, {
      method: "POST",
      body: JSON.stringify({ amount, notes }),
    }),
  deductFromClient: (id, amount, reason) =>
    apiRequest(`/admin/clients/${id}/deduct`, {
      method: "POST",
      body: JSON.stringify({ amount, reason }),
    }),
  suspendClient: (id, reason, duration) =>
    apiRequest(`/admin/clients/${id}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason, duration }),
    }),
  // Consultant detail endpoints
  getConsultantById: (id) => apiRequest(`/admin/consultants/${id}`),
  getConsultantBookings: (id) =>
    apiRequest(`/admin/consultants/${id}/bookings`),
  getConsultantEarnings: (id) =>
    apiRequest(`/admin/consultants/${id}/earnings`),
  getConsultantWithdrawals: (id) =>
    apiRequest(`/admin/consultants/${id}/withdrawals`),
  sendProfitToConsultant: (id, amount, notes) =>
    apiRequest(`/admin/consultants/${id}/profit`, {
      method: "POST",
      body: JSON.stringify({ amount, notes }),
    }),
  deductFromConsultant: (id, amount, reason) =>
    apiRequest(`/admin/consultants/${id}/deduct`, {
      method: "POST",
      body: JSON.stringify({ amount, reason }),
    }),
  suspendConsultant: (id, reason, duration) =>
    apiRequest(`/admin/consultants/${id}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason, duration }),
    }),
  // Reports export
  exportReportsPDF: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/admin/reports/export/pdf${
      queryString ? `?${queryString}` : ""
    }`;
  },
  exportReportsCSV: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/admin/reports/export/csv${
      queryString ? `?${queryString}` : ""
    }`;
  },
  // Payments export
  exportPaymentsCSV: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/admin/payments/export/csv${
      queryString ? `?${queryString}` : ""
    }`;
  },
  // Session management
  createDirectSession: (userId, sessionType = "chat") =>
    apiRequest(`/admin/sessions/direct`, {
      method: "POST",
      body: JSON.stringify({ userId, sessionType }),
    }),
  deleteSession: (sessionId) =>
    apiRequest(`/admin/sessions/${sessionId}`, {
      method: "DELETE",
    }),
  stopSession: (sessionId) =>
    apiRequest(`/admin/sessions/${sessionId}/stop`, {
      method: "PUT",
    }),
  // Users
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${queryString ? `?${queryString}` : ""}`);
  },
};

// Settings API
export const settingsAPI = {
  getGeneralSettings: () => apiRequest("/settings/general"),
  updateGeneralSettings: (data) =>
    apiRequest("/settings/general", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getPaymentSettings: () => apiRequest("/settings/payment"),
  updatePaymentSettings: (data) =>
    apiRequest("/settings/payment", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getIntegrationSettings: () => apiRequest("/settings/integration"),
  updateIntegrationSettings: (data) =>
    apiRequest("/settings/integration", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getLegalSettings: () => apiRequest("/settings/legal"),
  getPublicLegalSettings: () => apiRequest("/settings/public/legal"),
  updateLegalSettings: (data) =>
    apiRequest("/settings/legal", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Services API
export const servicesAPI = {
  getServices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/services${queryString ? `?${queryString}` : ""}`);
  },
  getServiceById: (id) => apiRequest(`/services/${id}`),
  createService: (data) =>
    apiRequest("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateService: (id, data) =>
    apiRequest(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteService: (id) =>
    apiRequest(`/services/${id}`, {
      method: "DELETE",
    }),
};

// Bookings API
export const bookingsAPI = {
  getBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/bookings${queryString ? `?${queryString}` : ""}`);
  },
  getBookingById: (id) => apiRequest(`/bookings/${id}`),
  createBooking: (data) =>
    apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBookingStatus: (id, status, notes) =>
    apiRequest(`/bookings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, consultantNotes: notes }),
    }),
  cancelBooking: (id) =>
    apiRequest(`/bookings/${id}/cancel`, {
      method: "PUT",
    }),
  rateBooking: (id, rating, comment) =>
    apiRequest(`/bookings/${id}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),
};

// Notifications API (will be enhanced below)

// CMS API
export const cmsAPI = {
  getPages: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/cms${queryString ? `?${queryString}` : ""}`);
  },
  getPageBySlug: (slug) => apiRequest(`/cms/${slug}`),
  createPage: (data) =>
    apiRequest("/cms", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePage: (id, data) =>
    apiRequest(`/cms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePage: (id) =>
    apiRequest(`/cms/${id}`, {
      method: "DELETE",
    }),
};

// Articles API
export const articlesAPI = {
  getArticles: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/articles${queryString ? `?${queryString}` : ""}`);
  },
  getArticleById: (id) => apiRequest(`/articles/id/${id}`),
  getArticleBySlug: (slug) => apiRequest(`/articles/${slug}`),
  createArticle: (data) =>
    apiRequest("/articles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateArticle: (id, data) =>
    apiRequest(`/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteArticle: (id) =>
    apiRequest(`/articles/${id}`, {
      method: "DELETE",
    }),
  publishArticle: (id) =>
    apiRequest(`/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: "PUBLISHED",
        publishedAt: new Date().toISOString(),
      }),
    }),
};

// Permissions API
export const permissionsAPI = {
  getPermissions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/permissions/permissions${queryString ? `?${queryString}` : ""}`
    );
  },
  getRoles: () => apiRequest("/permissions/roles"),
  createRole: (data) =>
    apiRequest("/permissions/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRole: (id, data) =>
    apiRequest(`/permissions/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteRole: (id) =>
    apiRequest(`/permissions/roles/${id}`, {
      method: "DELETE",
    }),
  assignRoleToUser: (userId, roleId, expiresAt) =>
    apiRequest(`/permissions/users/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ roleId, expiresAt }),
    }),
  getUserPermissions: (userId) =>
    apiRequest(`/permissions/users/${userId}/permissions`),
  initializePermissions: () =>
    apiRequest("/permissions/initialize", {
      method: "POST",
    }),
};

// Files API
export const filesAPI = {
  uploadFile: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: `HTTP error! status: ${response.status}` }));
      throw new Error(
        error.error || `Failed to upload file: ${response.status}`
      );
    }

    return await response.json();
  },
  getFilesByOwner: (ownerType, ownerId) =>
    apiRequest(`/files/files?ownerType=${ownerType}&ownerId=${ownerId}`),
  downloadFile: (id) =>
    `${API_BASE_URL}/files/files/${id}/download?token=${getAuthToken()}`,
  deleteFile: (id) =>
    apiRequest(`/files/files/${id}`, {
      method: "DELETE",
    }),
};

// Messages API
export const messageAPI = {
  getConversations: () => apiRequest("/messages/conversations"),
  getMessages: (sessionId) => apiRequest(`/messages/session/${sessionId}`),
  sendMessage: (sessionId, data) =>
    apiRequest(`/messages/session/${sessionId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sendMessageAsAdmin: (sessionId, data) =>
    apiRequest(`/messages/session/${sessionId}/admin`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  markAsRead: (sessionId) =>
    apiRequest(`/messages/session/${sessionId}/read`, {
      method: "PUT",
    }),
};

// Sessions/Video API
export const sessionsAPI = {
  getSessionByBooking: (bookingId) =>
    apiRequest(`/sessions/booking/${bookingId}`),
  startSession: (bookingId, roomId) =>
    apiRequest(`/sessions/booking/${bookingId}/start`, {
      method: "POST",
      body: JSON.stringify({ roomId }),
    }),
  endSession: (bookingId) =>
    apiRequest(`/sessions/booking/${bookingId}/end`, {
      method: "POST",
    }),
  generateVideoRoom: (bookingId) =>
    apiRequest(`/sessions/booking/${bookingId}/video-room`, {
      method: "POST",
    }),
  getVideoRoom: (bookingId) =>
    apiRequest(`/sessions/booking/${bookingId}/video-room`),
};

// Monitoring API
export const monitoringAPI = {
  getSystemLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/monitoring/logs/system${queryString ? `?${queryString}` : ""}`
    );
  },
  getAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/monitoring/logs/audit${queryString ? `?${queryString}` : ""}`
    );
  },
  getSecurityStats: () => apiRequest("/monitoring/security/stats"),
};

// Enhanced Notifications API
export const notificationsAPI = {
  getNotifications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/notifications${queryString ? `?${queryString}` : ""}`);
  },
  markAsRead: (id) =>
    apiRequest(`/notifications/${id}/read`, {
      method: "PUT",
    }),
  markAllAsRead: () =>
    apiRequest("/notifications/read-all", {
      method: "PUT",
    }),
  deleteNotification: (id) =>
    apiRequest(`/notifications/${id}`, {
      method: "DELETE",
    }),
  sendNotification: (data) =>
    apiRequest("/notifications/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sendBulkNotifications: (data) =>
    apiRequest("/notifications/send-bulk", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAllNotifications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/notifications/all${queryString ? `?${queryString}` : ""}`
    );
  },
  getNotificationStats: () => apiRequest("/notifications/stats"),
};

// Support API
export const supportAPI = {
  getMyTickets: () => apiRequest("/support/my-tickets"),
  getAllTickets: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/support${queryString ? `?${queryString}` : ""}`);
  },
  getTicketById: (id) => apiRequest(`/support/${id}`),
  createTicket: (data) =>
    apiRequest("/support", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTicket: (id, data) =>
    apiRequest(`/support/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  addComment: (id, content) =>
    apiRequest(`/support/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  getTicketStats: () => apiRequest("/support/stats/overview"),
};

// Reports API
export const reportAPI = {
  getReports: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports${queryString ? `?${queryString}` : ""}`);
  },
  getReportById: (id) => apiRequest(`/reports/${id}`),
  getPublicReports: () => apiRequest('/reports/public'),
  getPublicReportById: (id) => apiRequest(`/reports/public/${id}`),
  uploadReport: (formData) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then((res) => res.json());
  },
  reviewReport: (id, status) =>
    apiRequest(`/reports/${id}/review`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// Partners API
export const partnersAPI = {
  getPartners: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/partners${queryString ? `?${queryString}` : ''}`);
  },
  getPartnerById: (id) => apiRequest(`/partners/${id}`),
  createPartner: (data) =>
    apiRequest('/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePartner: (id, data) =>
    apiRequest(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePartner: (id) =>
    apiRequest(`/partners/${id}`, {
      method: 'DELETE',
    }),
};

// Categories API
export const categoriesAPI = {
  getCategories: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/categories${queryString ? `?${queryString}` : ''}`);
  },
  getCategoryById: (id) => apiRequest(`/categories/${id}`),
  createCategory: (data) =>
    apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id, data) =>
    apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id) =>
    apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Sliders API
export const slidersAPI = {
  getSliders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/sliders${queryString ? `?${queryString}` : ''}`);
  },
  getSliderById: (id) => apiRequest(`/sliders/${id}`),
  createSlider: (data) =>
    apiRequest('/sliders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSlider: (id, data) =>
    apiRequest(`/sliders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSlider: (id) =>
    apiRequest(`/sliders/${id}`, {
      method: 'DELETE',
    }),
};

// Video API
export const videoAPI = {
  getVideoToken: (channelName) => 
    apiRequest("/video/token", {
      method: "POST",
      body: JSON.stringify({ channelName }),
    }),
};

export default {
  authAPI,
  clientAPI,
  consultantAPI,
  adminAPI,
  servicesAPI,
  bookingsAPI,
  notificationsAPI,
  cmsAPI,
  articlesAPI,
  permissionsAPI,
  filesAPI,
  messageAPI,
  sessionsAPI,
  monitoringAPI,
  supportAPI,
  reportAPI,
  partnersAPI,
  categoriesAPI,
  slidersAPI,
  settingsAPI,
  videoAPI,
  getVideoToken: videoAPI.getVideoToken, // Shortcut for easier access
};
