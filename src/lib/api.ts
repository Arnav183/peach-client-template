const BASE = '/api';
const tok = () => localStorage.getItem('token');

async function req(method: string, path: string, body?: any) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(tok() ? { Authorization: 'Bearer ' + tok() } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email: string, password: string) => req('POST', '/auth/login', { email, password }),
  me: () => req('GET', '/auth/me'),
  settings: () => req('GET', '/settings'),
  updateSettings: (d: any) => req('PUT', '/settings', d),
  services: () => req('GET', '/services'),
  dashboard: () => req('GET', '/dashboard'),
  clients: () => req('GET', '/clients'),
  createClient: (d: any) => req('POST', '/clients', d),
  updateClient: (id: number, d: any) => req('PUT', '/clients/' + id, d),
  deleteClient: (id: number) => req('DELETE', '/clients/' + id),
  appointments: () => req('GET', '/appointments'),
  createAppointment: (d: any) => req('POST', '/appointments', d),
  updateAppointment: (id: number, d: any) => req('PUT', '/appointments/' + id, d),
  deleteAppointment: (id: number) => req('DELETE', '/appointments/' + id),
  invoices: () => req('GET', '/invoices'),
  createInvoice: (d: any) => req('POST', '/invoices', d),
  updateInvoice: (id: number, d: any) => req('PUT', '/invoices/' + id, d),
  deleteInvoice: (id: number) => req('DELETE', '/invoices/' + id),
  bookingSlots: (date?: string) => req('GET', '/bookings/slots' + (date ? '?date=' + date : '')),
  createSlot: (d: any) => req('POST', '/bookings/slots', d),
  bookingRequest: (d: any) => req('POST', '/bookings/request', d),
  reminders: () => req('GET', '/reminders'),
  sendReminder: (appointment_id: number) => req('POST', '/reminders/send', { appointment_id }),
  reviews: () => req('GET', '/reviews'),
  requestReview: (client_id: number, client_name: string) => req('POST', '/reviews/request', { client_id, client_name }),
  addReview: (d: any) => req('POST', '/reviews', d),
  followups: () => req('GET', '/followups'),
  createFollowup: (d: any) => req('POST', '/followups', d),
  sendFollowup: (id: number) => req('PUT', '/followups/' + id + '/send', {}),
  campaigns: () => req('GET', '/campaigns'),
  createCampaign: (d: any) => req('POST', '/campaigns', d),
  sendCampaign: (id: number) => req('PUT', '/campaigns/' + id + '/send', {}),
  chatConfig: () => req('GET', '/chat/config'),
  seoStatus: () => req('GET', '/seo/status'),
  socialTemplates: () => req('GET', '/social/templates'),
  supportStatus: () => req('GET', '/support/status'),
};
