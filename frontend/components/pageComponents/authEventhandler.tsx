'use client';

import { useEffect } from "react";
import { toast } from "sonner";
import { setLogoutHandler } from "@/lib/authBridge";
import { useAuth } from "../../authContext/authContext";
import { API_BASE } from "@/lib/api";

export default function AuthEventHandler() {
  const { logout, login } = useAuth();

  useEffect(() => {
    setLogoutHandler(() => {
      logout(true);
      toast.error("Session expired. You are now logged out.");
    });
  }, [logout]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldExchange = params.get("oauth") === "1";

    if (!shouldExchange) return;

    const exchange = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/google/exchange`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Google exchange failed");
        }

        const data = await res.json();
        if (data?.accessToken && data?.sessionId && data?.user) {
          login(data.user, data.accessToken, data.sessionId);
        } else {
          throw new Error("Missing session data");
        }
      } catch (err) {
        console.error(err);
        toast.error("Google login failed. Please try again.");
      } finally {
        params.delete("oauth");
        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`;
        window.history.replaceState({}, "", nextUrl);
      }
    };

    void exchange();
  }, [login]);

  return null;
}