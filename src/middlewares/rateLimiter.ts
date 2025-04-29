import { Response, Request, NextFunction } from "express";
import redis from "../utils/redis";

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const key = `rate_limit:${ip}`;
    const currentTime = Date.now();
    const windowSize = 60 * 1000; // 1 minute
    const maxRequests = 100; // Max requests per minute

    // Get the current request count and timestamp from Redis
    const data = await redis.get(key);
    let requestCount = 0;
    let firstRequestTime = currentTime;

    if (data) {
      const parsedData = JSON.parse(data);
      requestCount = parsedData.count;
      firstRequestTime = parsedData.timestamp;
    }

    // Check if the time window has expired
    if (currentTime - firstRequestTime > windowSize) {
      requestCount = 0; // Reset the count if the time window has expired
      firstRequestTime = currentTime;
    }

    // Increment the request count
    requestCount++;

    // Check if the rate limit has been exceeded
    if (requestCount > maxRequests) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    // Store the updated request count and timestamp in Redis
    await redis.set(
      key,
      JSON.stringify({ count: requestCount, timestamp: firstRequestTime }),
      "EX",
      Math.floor(windowSize / 1000)
    );

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in rate limiter middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
