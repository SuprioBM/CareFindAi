"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { User, AuthContextType } from "@/types/types";
import { setAccessToken, clearAccessToken, getAccessToken } from "@/lib/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===================== Robust session restore =====================
  useEffect(() => {
    let mounted = true;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const restoreSession = async () => {
      try {
        let token = getAccessToken();

        // 🔥 ALWAYS attempt refresh first (not conditional)
        let refreshRes = await apiFetch("/auth/refresh", {
          method: "POST",
        });

        // 🔁 Retry once (fixes mobile cookie timing issue)
        if (!refreshRes.ok) {
          await sleep(150);
          refreshRes = await apiFetch("/auth/refresh", {
            method: "POST",
          });
        }

        if (!refreshRes.ok) {
          if (mounted) {
            clearAccessToken();
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const data = await refreshRes.json();
        token = data?.accessToken ?? null;

        if (token) {
          setAccessToken(token);
        }

        // 🔒 Ensure token propagation before /me
        await sleep(50);

        const meRes = await apiFetch("/auth/me");

        if (meRes.ok && mounted) {
          const meData = await meRes.json();
          setUser(meData);
        } else if (mounted) {
          setUser(null);
        }
      } catch {
        if (mounted) {
          setUser(null);
          clearAccessToken();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
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