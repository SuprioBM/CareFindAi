import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getRedis } from "../config/redis.js";

const ACCESS_EXP = "5m";
const REFRESH_EXP = 7 * 24 * 60 * 60; // seconds

export async function issueSession(req,res, user) {
  const redis = getRedis();

  const refreshToken = crypto.randomBytes(32).toString("hex");
  const sid = crypto.randomBytes(16).toString("hex");

  const sessionData = {
    userID: user._id.toString(),
    sid,
    name: user.name,
    email: user.email,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    createdAt: Date.now(),
  };  
  await redis.set(
    `sess:${refreshToken}`,
    JSON.stringify(sessionData),
    { EX: REFRESH_EXP },
  );

  await redis.set(`sid:${sid}`, refreshToken, { EX: REFRESH_EXP });
  await redis.sAdd(`userSessions:${user._id.toString()}`, sid);

  const accessToken = jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXP },
  );

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_EXP * 1000,
  });

  return {
    accessToken,
    user: { id: user._id.toString(), name: user.name, email: user.email },
  };
}

export async function revokeAllSessionsForUser(userID) {
  const redis = getRedis();
  const setKey = `userSessions:${userID}`;
  const sids = await redis.sMembers(setKey);

  for (const sid of sids) {
    const rt = await redis.get(`sid:${sid}`);
    if (rt) await redis.del(`sess:${rt}`);
    await redis.del(`sid:${sid}`);
  }

  await redis.del(setKey);
}