import { getRedis } from "../config/redis.js";

const MAX_FAILS = 5; // allow 5 wrong attempts
const LOCK_MINUTES = 15; // lock for 15 minutes

export async function checkLockout(req, res, next) {
  try {
    const redis = getRedis();
    const email = (req.body?.email || "").toLowerCase().trim();

    // if no email, just continue (Zod will catch later)
    if (!email) return next();

    const lockKey = `lock:${email}`;
    const locked = await redis.get(lockKey);

    if (locked) {
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked. Try again later.",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

// helpers your controller will call
export async function recordFail(email) {
  const redis = getRedis();
  const e = email.toLowerCase().trim();

  const failKey = `fail:${e}`;
  const lockKey = `lock:${e}`;

  const fails = await redis.incr(failKey);

  // expire fail counter window (15 mins)
  if (fails === 1) {
    await redis.expire(failKey, LOCK_MINUTES * 60);
  }

  if (fails >= MAX_FAILS) {
    await redis.set(lockKey, "1", { EX: LOCK_MINUTES * 60 });
    await redis.del(failKey);
    return true; // locked now
  }

  return false;
}

export async function resetFail(email) {
  const redis = getRedis();
  const e = email.toLowerCase().trim();
  await redis.del(`fail:${e}`);
}
