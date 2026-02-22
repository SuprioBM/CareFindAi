export const API_BASE = process.env.NEXT_PUBLIC_API_URL;
import { getAccessToken, setAccessToken, clearAccessToken } from "./auth"; // helpers to manage memory token

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { body, headers, ...rest } = options;

  let accessToken: string | null = getAccessToken();

  
  const fetchWithToken = async () => {
    return fetch(`${API_BASE}${endpoint}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: "include", 
      body: body ? body : undefined,
    });
  };

  let res = await fetchWithToken();

  // If 401 → try refresh
  if (res.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends HttpOnly refresh cookie
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      accessToken = data.accessToken;
      if (accessToken) {
        setAccessToken(accessToken);
      } else {
        clearAccessToken();
      }


      // Retry original request with new access token
      res = await fetchWithToken();
    } else {
      // Refresh failed → clear memory token + force logout
      clearAccessToken();
      throw new Error("Session expired. Please log in again.");
    }
  }

  return res;
}
