"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { User, AuthContextType } from "@/types/types";
import { setAccessToken, clearAccessToken } from "@/lib/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===================== Silent refresh on app load =====================
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await apiFetch("/auth/refresh", { method: "POST" }); // sends HttpOnly cookie automatically
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken); // save in memory

          // Fetch user data after refresh
          const meRes = await apiFetch("/auth/me");
          if (meRes.ok) {
            const meData = await meRes.json();
            
            setUser(meData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ===================== Auto-refresh access token =====================
  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const res = await apiFetch("/auth/refresh", { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            setAccessToken(data.accessToken);
            
          } else {
            setUser(null);
            clearAccessToken();
          }
        } catch {
          setUser(null);
          clearAccessToken();
        }
      },
      2.5 * 60 * 1000,
    ); // 2.5 minutes, can adjust based on access token lifetime

    return () => clearInterval(interval);
  }, []);

  // ===================== Login / Logout =====================
  const login = (user: User, accessToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
    clearAccessToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
