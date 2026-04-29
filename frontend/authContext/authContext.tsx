"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { User, AuthContextType } from "@/types/types";
import { setAccessToken, clearAccessToken, getAccessToken } from "@/lib/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===================== Restore session (SAFE) =====================
  useEffect(() => {
    const restoreSession = async () => {
      try {
        let token = getAccessToken();

        // 🔥 Only refresh if NO token exists
        if (!token) {
          const res = await apiFetch("/auth/refresh", { method: "POST" });

          if (res.ok) {
            const data = await res.json();
            token = data?.accessToken ?? null;

            if (token) {
              setAccessToken(token);
            }
          } else {
            clearAccessToken();
            setUser(null);
            return;
          }
        }

        // ✅ Fetch user regardless (token may already be valid)
        const meRes = await apiFetch("/auth/me");

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ===================== Login / Logout =====================
  const login = (user: User, accessToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
  };

  const logout = useCallback(async (silent?: boolean): Promise<void> => {
    try {
      if (!silent) {
        await apiFetch("/auth/logout", { method: "POST" });
      }
    } catch {}

    sessionStorage.clear();
    setUser(null);
    clearAccessToken();
  }, []);

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