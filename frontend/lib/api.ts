export const API_BASE = process.env.NEXT_PUBLIC_API_URL;

import { getAccessToken, setAccessToken, clearAccessToken } from "./auth";
import { triggerLogout } from "./authBridge";

let refreshPromise: Promise<string | null> | null = null;

const NO_REFRESH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/resend-verification",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
];

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { body, headers, ...rest } = options;

  let accessToken: string | null = getAccessToken();
  let sessionId: string | null = localStorage.getItem("sessionId");

  const fetchWithToken = async () => {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    return fetch(`${API_BASE}${endpoint}`, {
      ...rest,
      headers: {
        ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: "include",
      body: body ? body : undefined,
    });
  };

  let res = await fetchWithToken();
  let retried = false;

  const shouldSkipRefresh = NO_REFRESH_ENDPOINTS.some((e) =>
    endpoint.startsWith(e),
  );

  if (res.status === 401 && !shouldSkipRefresh && !retried) {
    retried = true;

   refreshPromise = (async () => {
  const sessionId = localStorage.getItem("sessionId"); // 🔥 ALWAYS FRESH READ


  if (!sessionId) {
    clearAccessToken();
    return null;
  }

  const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!refreshRes.ok) {
    clearAccessToken();
    refreshPromise = null;
    return null;
  }

  const data = await refreshRes.json();
  const newToken = data?.accessToken ?? null;

  if (newToken) {
    setAccessToken(newToken);
  } else {
    clearAccessToken();
  }

  refreshPromise = null;
  return newToken;
})();

    const newToken = await refreshPromise;

    if (!newToken) {
      clearAccessToken();
      triggerLogout();
      throw Object.assign(new Error("Session expired. Please log in again."), {
        code: "SESSION_EXPIRED",
      });
    }

    accessToken = newToken;

    res = await fetchWithToken();
  }

  return res;
}