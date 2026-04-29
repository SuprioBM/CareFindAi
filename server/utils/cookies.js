export function getRefreshCookieOptions() {

  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
    
  };
}

export function getRefreshCookieOptionsWithMaxAge(maxAgeMs) {
  return {
    ...getRefreshCookieOptions(),
    maxAge: maxAgeMs,
  };
}
