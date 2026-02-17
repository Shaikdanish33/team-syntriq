"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const TOKEN_KEY = "acadex-auth-token"

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function apiRequest<T>(path: string, options: RequestInit = {}, withAuth = false): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")

  const token = getStoredToken()
  if (withAuth && token) headers.set("Authorization", `Bearer ${token}`)
  if (!withAuth && token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const data = (await response.json().catch(() => ({}))) as { error?: string } & T

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed")
  }
  return data
}

export const authApi = {
  signup: (payload: {
    name: string
    email: string
    password: string
    college: string
    course: string
    branch: string
    semester: string
  }) =>
    apiRequest<{ message: string; token: string | null; user: any }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<{ message: string; token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  session: () => apiRequest<{ user: any }>("/api/auth/session", { method: "GET" }, true),

  updateProfile: (payload: Record<string, unknown>) =>
    apiRequest<{ user: any }>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }, true),

  logout: () => apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" }),
}

export const resourceApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ""
    return apiRequest<{ resources: any[] }>(`/api/resources${query}`, { method: "GET" })
  },
  getById: (id: string) => apiRequest<{ resource: any }>(`/api/resources/${id}`, { method: "GET" }),
  create: (payload: Record<string, unknown>) =>
    apiRequest<{ resource: any; pointsAwarded: number }>("/api/resources", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),
  update: (id: string, payload: Record<string, unknown>) =>
    apiRequest<{ resource: any }>(`/api/resources/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, true),
  remove: (id: string) =>
    apiRequest<{ message: string }>(`/api/resources/${id}`, { method: "DELETE" }, true),
}

export const requestApi = {
  list: () => apiRequest<{ requests: any[] }>("/api/resources/requests/list", { method: "GET" }),
  create: (payload: Record<string, unknown>) =>
    apiRequest<{ request: any }>("/api/resources/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),
  fulfill: (id: string, resourceId: string) =>
    apiRequest<{ message: string }>(`/api/resources/requests/${id}/fulfill`, {
      method: "PATCH",
      body: JSON.stringify({ resourceId }),
    }, true),
}

export const reviewApi = {
  listByResource: (resourceId: string) =>
    apiRequest<{ reviews: any[] }>(`/api/reviews?resourceId=${encodeURIComponent(resourceId)}`),
  create: (payload: Record<string, unknown>) =>
    apiRequest<{ review: any }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true),
  update: (id: string, payload: Record<string, unknown>) =>
    apiRequest<{ review: any }>(`/api/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }, true),
  remove: (id: string) =>
    apiRequest<{ message: string }>(`/api/reviews/${id}`, { method: "DELETE" }, true),
}

export const leaderboardApi = {
  list: () => apiRequest<{ leaderboard: any[] }>("/api/leaderboard"),
}
