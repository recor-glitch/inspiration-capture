import { Request, Response, NextFunction } from "express";
import redis from "../utils/redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10;

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const redisKey = `ratelimit:${ip}`;

  try {
    const current = await redis.incr(redisKey);

    if (current === 1) {
      await redis.expire(redisKey, WINDOW_SECONDS);
    }

    const ttl = await redis.ttl(redisKey);

    if (current > MAX_REQUESTS) {
      res.status(429).json({
        error: "Too Many Requests",
        message: `Limit exceeded: ${MAX_REQUESTS} requests per ${WINDOW_SECONDS} seconds.`,
        retryAfter: ttl,
      });
      return;
    }

    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
    res.setHeader("X-RateLimit-Remaining", MAX_REQUESTS - current);
    res.setHeader("X-RateLimit-Reset", ttl);

    next();
  } catch (error) {
    console.error("Rate limiter failed:", error);
    res.status(500).json({ error: "Internal server error (rate limiter)" });
  }
};
