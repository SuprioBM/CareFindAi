import { OAuth2Client } from "google-auth-library";

export const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export function buildGoogleAuthUrl(state) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);

  // Optional (consent screen behavior)
  url.searchParams.set("prompt", "select_account");

  return url.toString();
}
