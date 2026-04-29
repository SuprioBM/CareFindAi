export function getRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/",
  };
}

export function getRefreshCookieOptionsWithMaxAge(maxAgeMs) {
  return {
    ...getRefreshCookieOptions(),
    maxAge: maxAgeMs,
  };
}
