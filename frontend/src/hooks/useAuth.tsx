import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  setTokenAndUser: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredToken(): string | null {
  return localStorage.getItem("token");
}

function decodeToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.id ?? payload.sub, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const decoded = decodeToken(token);
      setUser(decoded);
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.message ?? "Login failed" };
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { error: null };
    } catch {
      return { error: "Network error" };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.message ?? "Registration failed" };
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { error: null };
    } catch {
      return { error: "Network error" };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const setTokenAndUser = useCallback((token: string) => {
    localStorage.setItem("token", token);
    const decoded = decodeToken(token);
    setUser(decoded);
  }, []);

  const resetPassword = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.message ?? "Failed to send reset email" };
      }

      return { error: null };
    } catch {
      return { error: "Network error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        setTokenAndUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
