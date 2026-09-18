const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

interface LoginPayload {
  email: string
  password: string
}

interface AuthResponse {
  token: string
  user: { id: string; email: string; name?: string }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Request failed (${res.status})`)
  }

  return res.json()
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  localStorage.setItem("token", data.token)
  return data
}

export async function logout() {
  localStorage.removeItem("token")
}

export function getToken(): string | null {
  return localStorage.getItem("token")
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token")
}

export { request }
