const API_BASE = '/api/v1';

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('elhabchi_token');
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  const resData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = resData?.message || `Erreur serveur (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = resData;
    throw error;
  }

  return resData;
}

export const api = {
  // Public
  getPublicSettings: () => apiRequest('/settings/public'),
  getPackages: (eventType) => apiRequest(`/packages${eventType ? `?eventType=${eventType}` : ''}`),
  getDishes: (category) => apiRequest(`/dishes${category ? `?category=${category}` : ''}`),
  getServices: () => apiRequest('/services'),
  getRentableEquipment: (category) => apiRequest(`/equipment${category ? `?category=${category}` : ''}`),
  getEquipmentAvailability: (from, to) => apiRequest(`/equipment/availability?from=${from}&to=${to}`),
  getDateAvailability: (date) => apiRequest(`/availability/date?date=${date}`),
  getMonthlyCalendar: (month) => apiRequest(`/availability/calendar?month=${month}`),
  estimateBooking: (payload) => apiRequest('/bookings/estimate', { method: 'POST', body: payload }),
  createPublicBooking: (payload) => apiRequest('/bookings/public', { method: 'POST', body: payload }),
  recordWhatsAppClick: (code) => apiRequest(`/bookings/public/${code}/whatsapp-click`, { method: 'POST' }),
  trackBooking: (code, phone) => apiRequest(`/bookings/track?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`),
  respondToBooking: (code, payload) => apiRequest(`/bookings/track/${encodeURIComponent(code)}/respond`, { method: 'PATCH', body: payload }),
  submitContact: (payload) => apiRequest('/bookings/contact', { method: 'POST', body: payload }),
  getGallery: (eventType) => apiRequest(`/gallery${eventType ? `?eventType=${eventType}` : ''}`),
  getTestimonials: () => apiRequest('/testimonials'),
  submitTestimonial: (payload) => apiRequest('/testimonials', { method: 'POST', body: payload }),

  // Auth & Admin
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  getDashboardStats: () => apiRequest('/dashboard/stats'),
  getMonthlyRevenue: (year) => apiRequest(`/dashboard/revenue?year=${year}`),
  getUpcomingEvents: (days) => apiRequest(`/dashboard/upcoming?days=${days}`),
  getTopItems: () => apiRequest('/dashboard/top-items'),
  getStockAlerts: () => apiRequest('/dashboard/stock-alerts'),

  // Bookings Admin
  getAdminBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/bookings?${q}`);
  },
  getAdminBookingById: (id) => apiRequest(`/bookings/${id}`),
  createAdminBooking: (payload) => apiRequest('/bookings', { method: 'POST', body: payload }),
  updateAdminBooking: (id, payload) => apiRequest(`/bookings/${id}`, { method: 'PUT', body: payload }),
  updateBookingStatus: (id, payload) => apiRequest(`/bookings/${id}/status`, { method: 'PATCH', body: payload }),
  addPayment: (id, payload) => apiRequest(`/bookings/${id}/payments`, { method: 'POST', body: payload }),
  removePayment: (id, paymentId) => apiRequest(`/bookings/${id}/payments/${paymentId}`, { method: 'DELETE' }),
  addInternalNote: (id, text) => apiRequest(`/bookings/${id}/notes`, { method: 'POST', body: { text } }),
  sendQuoteEmail: (id) => apiRequest(`/bookings/${id}/send-quote`, { method: 'POST' }),
  getWhatsAppReplyLink: (id, template) => apiRequest(`/bookings/${id}/whatsapp-link?template=${template}`),
  deleteBooking: (id) => apiRequest(`/bookings/${id}`, { method: 'DELETE' }),

  // Equipment Admin
  getAdminEquipment: () => apiRequest('/equipment'),
  createEquipment: (payload) => apiRequest('/equipment', { method: 'POST', body: payload }),
  updateEquipment: (id, payload) => apiRequest(`/equipment/${id}`, { method: 'PUT', body: payload }),
  adjustStock: (id, payload) => apiRequest(`/equipment/${id}/stock`, { method: 'PATCH', body: payload }),
  getEquipmentMovements: (id) => apiRequest(`/equipment/${id}/movements`),
  deleteEquipment: (id) => apiRequest(`/equipment/${id}`, { method: 'DELETE' }),

  // Menus Admin
  createDish: (payload) => apiRequest('/dishes', { method: 'POST', body: payload }),
  updateDish: (id, payload) => apiRequest(`/dishes/${id}`, { method: 'PUT', body: payload }),
  deleteDish: (id) => apiRequest(`/dishes/${id}`, { method: 'DELETE' }),

  // Packages Admin
  createPackage: (payload) => apiRequest('/packages', { method: 'POST', body: payload }),
  updatePackage: (id, payload) => apiRequest(`/packages/${id}`, { method: 'PUT', body: payload }),
  deletePackage: (id) => apiRequest(`/packages/${id}`, { method: 'DELETE' }),

  // Services Admin
  createService: (payload) => apiRequest('/services', { method: 'POST', body: payload }),
  updateService: (id, payload) => apiRequest(`/services/${id}`, { method: 'PUT', body: payload }),
  deleteService: (id) => apiRequest(`/services/${id}`, { method: 'DELETE' }),

  // Availability & Blocked dates Admin
  getBlockedDates: () => apiRequest('/availability/blocked-dates'),
  blockDate: (payload) => apiRequest('/availability/blocked-dates', { method: 'POST', body: payload }),
  unblockDate: (id) => apiRequest(`/availability/blocked-dates/${id}`, { method: 'DELETE' }),

  // Users & Settings Admin
  getUsers: () => apiRequest('/users'),
  createUser: (payload) => apiRequest('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => apiRequest(`/users/${id}`, { method: 'PUT', body: payload }),
  toggleUserStatus: (id) => apiRequest(`/users/${id}/status`, { method: 'PATCH' }),
  deleteUser: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  getSettings: () => apiRequest('/settings'),
  updateSettings: (payload) => apiRequest('/settings', { method: 'PUT', body: payload }),
  approveTestimonial: (id) => apiRequest(`/testimonials/${id}/approve`, { method: 'PATCH' }),
  deleteTestimonial: (id) => apiRequest(`/testimonials/${id}`, { method: 'DELETE' })
};
