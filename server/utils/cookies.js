export function getRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: true,        
    sameSite: "lax",    
    path: "/", 
  };
}

export function getRefreshCookieOptionsWithMaxAge(maxAgeMs) {
  return {
    ...getRefreshCookieOptions(),
    maxAge: maxAgeMs,
  };
}
