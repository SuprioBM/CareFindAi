export function getRefreshCookieOptions() {

  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
}

export function getRefreshCookieOptionsWithMaxAge(maxAgeMs) {
  return {
    ...getRefreshCookieOptions(),
    maxAge: maxAgeMs,
  };
}
