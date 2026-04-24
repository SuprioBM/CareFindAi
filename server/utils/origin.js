function normalizeOrigin(origin) {
  if (!origin || typeof origin !== "string") return "";
  return origin.trim().replace(/\/+$/, "");
}

export function getAllowedOrigins() {
  const raw = process.env.CLIENT_ORIGIN || "http://localhost:3000";

  return raw
    .split(",")
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean);
}

export function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  const allowed = getAllowedOrigins();
  return allowed.includes(normalized);
}
