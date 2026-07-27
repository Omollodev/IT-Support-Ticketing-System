const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  submitTicket: (payload) =>
    request("/tickets", { method: "POST", body: JSON.stringify(payload) }),
  listTickets: (status) =>
    request(`/tickets${status ? `?status=${status}` : ""}`),
  getStats: () => request("/tickets/stats"),
  updateTicket: (id, payload) =>
    request(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
