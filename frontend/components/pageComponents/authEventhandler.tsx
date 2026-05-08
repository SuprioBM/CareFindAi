'use client';

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { setLogoutHandler } from "@/lib/authBridge";
import { useAuth } from "../../authContext/authContext";
import { API_BASE } from "@/lib/api";

export default function AuthEventHandler() {
  const { logout, login } = useAuth();
  const exchangeInFlight = useRef(false);

  useEffect(() => {
    setLogoutHandler(() => {
      logout(true);
      toast.error("Session expired. You are now logged out.");
    });
  }, [logout]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("oauth_code");

    if (!code) return;
    if (exchangeInFlight.current) return;

    exchangeInFlight.current = true;

    const exchange = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/google/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
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
        exchangeInFlight.current = false;
        params.delete("oauth_code");
        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`;
        window.history.replaceState({}, "", nextUrl);
      }
    };

    void exchange();
  }, [login]);

  return null;
}