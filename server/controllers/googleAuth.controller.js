import crypto from "crypto";
import User from "../models/User.model.js";
import { getRedis } from "../config/redis.js";
import { googleClient, buildGoogleAuthUrl } from "../config/googleOAuth.js";
import { issueSession } from "../utils/manageSessions.js";
import {
  getRefreshCookieOptions,
  getRefreshCookieOptionsWithMaxAge,
} from "../utils/cookies.js";

// 10 minutes for state
const STATE_TTL = 10 * 60;
// 60 seconds for one-time code exchange
const OAUTH_CODE_TTL = 60;

export async function googleStart(req, res) {
  const redis = getRedis();
  const redirect = req.query.redirect || "/";

  const state = crypto.randomBytes(16).toString("hex");
  await redis.set(
    `oauth:state:${state}`,
    JSON.stringify({
      redirect,
    }),
    { EX: STATE_TTL }, // 10 minutes
  );

  const authUrl = buildGoogleAuthUrl(state);
  return res.redirect(authUrl);
}

export async function googleCallback(req, res) {
  const redis = getRedis();

  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ message: "Missing code/state" });
    }

    // 1) Validate state (CSRF protection for OAuth)
      const stateStr = await redis.get(`oauth:state:${state}`);

      if (!stateStr) {
        return res
          .status(400)
          .json({ message: "Invalid or expired OAuth state" });
      }

      const stored = JSON.parse(stateStr);
      const redirectPath = stored.redirect || "/";

      // Delete state (one-time use)
      await redis.del(`oauth:state:${state}`);

    // 2) Exchange code for tokens (Node 20 has fetch built-in)
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code.toString(),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      return res
        .status(401)
        .json({ message: "Google token exchange failed", details: txt });
    }

    const tokenJson = await tokenRes.json();
    const idToken = tokenJson.id_token;
    if (!idToken)
      return res.status(401).json({ message: "No id_token from Google" });

    // 3) Verify id_token properly
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload)
      return res.status(401).json({ message: "Invalid Google token" });

    const email = (payload.email || "").toLowerCase().trim();
    const googleSub = payload.sub;
    const name = payload.name || "Google User";
    const emailVerifiedFromGoogle = payload.email_verified === true;

    if (!email || !googleSub) {
      return res
        .status(400)
        .json({ message: "Google account missing email/sub" });
    }

    // 4) Find or create/link user
    let user = await User.findOne({ $or: [{ googleSub }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,
        googleSub,
        authProvider: "google",
        emailVerified: emailVerifiedFromGoogle, // usually true
      });
    } else {
      // Link googleSub if missing
      let changed = false;

      if (!user.googleSub) {
        user.googleSub = googleSub;
        changed = true;
      }

      if (!user.emailVerified && emailVerifiedFromGoogle) {
        user.emailVerified = true;
        changed = true;
      }

      if (user.authProvider !== "google" && !user.password) {
        user.authProvider = "google";
        changed = true;
      }

      if (changed) await user.save();
    }

    // 5) Create YOUR session (redis refresh cookie + access jwt)
    const session = await issueSession(req, res, user);

    // 6) Create one-time exchange code to send access token safely to frontend
    const exchangeCode = crypto.randomBytes(20).toString("hex");
    await redis.set(`oauth:code:${exchangeCode}`, JSON.stringify(session), {
      EX: OAUTH_CODE_TTL,
    });

    // 7) Store exchange code in httpOnly cookie and redirect without sensitive params
    res.cookie(
      "oauth_code",
      exchangeCode,
      getRefreshCookieOptionsWithMaxAge(OAUTH_CODE_TTL * 1000),
    );

    // 8) Redirect to frontend with a non-sensitive flag to trigger exchange
    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
    const redirectUrl = new URL(redirectPath, clientOrigin);
    redirectUrl.searchParams.set("oauth", "1");
    return res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("googleCallback error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function googleExchange(req, res) {
  const redis = getRedis();
  try {
    const code = req.cookies?.oauth_code;
    if (!code) {
      return res.status(400).json({ message: "Missing exchange code" });
    }

    const sessionStr = await redis.get(`oauth:code:${code}`);
    if (!sessionStr) {
      return res.status(401).json({ message: "Invalid or expired exchange code" });
    }

    await redis.del(`oauth:code:${code}`);
    res.clearCookie("oauth_code", getRefreshCookieOptions());

    const session = JSON.parse(sessionStr);
    return res.json(session);
  } catch (err) {
    console.error("googleExchange error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

