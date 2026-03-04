import { getRedis } from "../config/redis.js";

export async function getSessions(req, res) {
  const redis = getRedis();

  try {
    const userID = req.user.id;

    const sids = await redis.sMembers(`userSessions:${userID}`);

    const sessions = [];

    for (const sid of sids) {
      const refreshToken = await redis.get(`sid:${sid}`);
      if (!refreshToken) continue;

      const sessionStr = await redis.get(`sess:${refreshToken}`);
      if (!sessionStr) continue;

      const session = JSON.parse(sessionStr);

      sessions.push({
        sid,
        name: session.name,
        email: session.email,
      });
    }

    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function revokeSession(req, res) {
  const redis = getRedis();

  try {
    const userID = req.user.id;
    const { sid } = req.params;

    const refreshToken = await redis.get(`sid:${sid}`);
    if (!refreshToken) {
      return res.status(404).json({ message: "Session not found" });
    }

    const sessionStr = await redis.get(`sess:${refreshToken}`);
    if (!sessionStr) {
      return res.status(404).json({ message: "Session invalid" });
    }

    const session = JSON.parse(sessionStr);

    if (session.userID !== userID) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await redis.del(`sess:${refreshToken}`);
    await redis.del(`sid:${sid}`);
    await redis.sRem(`userSessions:${userID}`, sid);

    res.json({ message: "Session revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}



export async function revokeAllSessions(req, res) {
  const redis = getRedis();

  try {
    const userID = req.user.id;

    const sids = await redis.sMembers(`userSessions:${userID}`);

    for (const sid of sids) {
      const refreshToken = await redis.get(`sid:${sid}`);

      if (refreshToken) {
        await redis.del(`sess:${refreshToken}`);
      }

      await redis.del(`sid:${sid}`);
    }

    await redis.del(`userSessions:${userID}`);

    res.json({ message: "All sessions revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
