import { API_URL } from '../config';

const TOKEN_KEY = 'taklifnoma_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);

const buildHeaders = (headers = {}, includeAuth = true) => {
  const nextHeaders = { ...headers };
  const token = getToken();

  if (!('Content-Type' in nextHeaders)) {
    nextHeaders['Content-Type'] = 'application/json';
  }

  if (includeAuth && token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  return nextHeaders;
};

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async (path, { method = 'GET', body, headers, auth = true } = {}) => {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: buildHeaders(headers, auth),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('taklifnoma_user');
        window.location.href = '/login';
      }
      throw new Error(payload?.error || payload?.message || `Request failed with status ${response.status}`);
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the shared API. Start the backend server and try again.');
    }

    throw error;
  }
};

export const db = {
  getStats: async () => request('/admin/stats'),

  getOrders: async () => {
    const payload = await request('/admin/stats');
    return Array.isArray(payload) ? payload : payload.orders;
  },

  getAdminOverview: async () => request('/admin/stats'),

  getAdminEmailSettings: async () => request('/admin/email-settings'),

  updateAdminEmailSettings: async (senderEmail) => request('/admin/email-settings', {
    method: 'PATCH',
    body: {
      sender_email: senderEmail,
    },
  }),

  getMyInvitations: async (deleted = false) => request(`/my-invitations?deleted=${deleted}`),

  getOrder: async (idOrSlug) => request(`/orders/lookup?ref=${encodeURIComponent(String(idOrSlug).trim())}`, { auth: false }),

  createOrder: async (orderData) => request('/orders', {
    method: 'POST',
    body: orderData,
  }),

  updateOrder: async (uuid, updateData) => request(`/orders/${encodeURIComponent(uuid)}`, {
    method: 'PATCH',
    body: updateData,
  }),

  uploadImage: async ({ dataUrl, fileName, mimeType }) => request('/uploads/image', {
    method: 'POST',
    body: {
      data_url: dataUrl,
      file_name: fileName,
      mime_type: mimeType,
    },
  }),

  uploadAudio: async ({ dataUrl, fileName, mimeType }) => request('/uploads/audio', {
    method: 'POST',
    body: {
      data_url: dataUrl,
      file_name: fileName,
      mime_type: mimeType,
    },
  }),

  deleteOrder: async (uuid) => request(`/orders/${encodeURIComponent(uuid)}`, {
    method: 'DELETE',
  }),

  restoreOrder: async (uuid) => request(`/orders/${encodeURIComponent(uuid)}/restore`, {
    method: 'POST',
  }),

  getRSVPs: async (orderIdOrSlug) => request(`/orders/lookup/rsvps?ref=${encodeURIComponent(String(orderIdOrSlug).trim())}`, {
    auth: false,
  }),

  addRSVP: async (orderIdOrSlug, rsvpData) => {
    const res = await request(`/orders/lookup/rsvps?ref=${encodeURIComponent(String(orderIdOrSlug).trim())}`, {
      method: 'POST',
      body: rsvpData,
      auth: false,
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rsvp-submitted', { detail: rsvpData }));
    }
    return res;
  },

  incrementView: async (idOrSlug) => request(`/orders/lookup/view?ref=${encodeURIComponent(String(idOrSlug).trim())}`, {
    method: 'POST',
    auth: false,
  }),

  login: async (email, password, adminLoginAttempt = false) => request('/auth/login', {
    method: 'POST',
    body: { email, password, adminLoginAttempt },
    auth: false,
  }),

  googleAuth: async (credential) => request('/auth/google', {
    method: 'POST',
    body: { credential },
    auth: false,
  }),

  signup: async (email, password, displayName) => request('/auth/signup', {
    method: 'POST',
    body: { email, password, displayName },
    auth: false,
  }),

  forgotPassword: async (email, language) => request('/auth/forgot-password', {
    method: 'POST',
    body: { email, language },
    auth: false,
  }),

  resetPassword: async (token, newPassword) => request('/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
    auth: false,
  }),

  updateAccountEmail: async (email, currentPassword) => request('/account/email', {
    method: 'PATCH',
    body: { email, currentPassword },
  }),

  updateAccountPassword: async (currentPassword, newPassword) => request('/account/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
  }),

  deleteUser: async (id) => request(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  restoreUser: async (id) => request(`/admin/users/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
  }),
};
