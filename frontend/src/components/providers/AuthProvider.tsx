"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export interface SessionUser {
  email: string;
  name: string;
  picture: string;
  role: "member" | "admin" | "super_admin";
  loginAt: string;
}

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "407408718192.apps.googleusercontent.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if session cookie is already active on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Required to send cookies cross-origin
        });

        if (res.ok) {
          const payload = await res.json();
          if (payload.success && payload.data) {
            setUser(payload.data);
          }
        }
      } catch (error) {
        console.error("Failed to check active auth session:", error);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const login = async (idToken: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
        credentials: "include", // Required to accept cookies from backend
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setUser(payload.data);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Login verification call failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout endpoint call failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
