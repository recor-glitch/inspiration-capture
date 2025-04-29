import { NextFunction, Request, Response } from "express";
import {
  extractLinkDetails,
  extractLinksFromPage,
} from "../services/puppeteer-service";
import { InspirationData } from "../types";
import {
  GetAllInspirationFromDB,
  GetInspirationFromDBBySlug,
  SaveInspiration,
} from "../services/prisma-service";
import redis from "../utils/redis";

export const GetInspirationFromURL = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: "URL is required" });
  }

  try {
    const links = await extractLinksFromPage(url);
    if (links.length === 0) {
      res.status(404).json({ error: "No links found" });
      return;
    }
    res.status(200).json({ links });
    return;
  } catch (error) {
    console.error("My error: ", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const AddInspiration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { links } = req.body;
  if (!links) {
    res.status(400).json({ error: "Links are required" });
    return;
  }

  try {
    const linkDetails: InspirationData[] = await Promise.all(
      links.map(async (link: string) => {
        const data = await extractLinkDetails(link);
        return data;
      })
    );
    const response = await SaveInspiration(linkDetails);
    res.status(200).json({
      message: "Inspiration saved successfully",
      updated: response.count,
    });
    return;
  } catch (error) {
    console.error("Error extracting link details:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const GetAllInspiration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const cachedKey = `inspirations:page:${page}:limit:${limit}`;

    const cachedData = await redis.get(cachedKey);
    if (cachedData) {
      console.log(`Cache hit: ${cachedKey}`);
      res.status(200).json(JSON.parse(cachedData));
      return;
    }

    const inspirations = await GetAllInspirationFromDB({ skip, limit });

    await redis.set(cachedKey, JSON.stringify(inspirations), "EX", 60);

    res.status(200).json(inspirations);
    return;
  } catch (error) {
    console.error("Error fetching inspirations:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const GetInspirationBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { slug } = req.params;
  if (!slug) {
    res.status(400).json({ error: "Slug is required" });
    return;
  }

  try {
    const cachedKey = `inspiration:${slug}`;
    const cachedData = await redis.get(cachedKey);
    if (cachedData) {
      console.log(`Cache hit: ${cachedKey}`);
      res.status(200).json(JSON.parse(cachedData));
      return;
    }

    const inspiration = await GetInspirationFromDBBySlug(slug);
    if (!inspiration) {
      res.status(404).json({ error: "Inspiration not found" });
      return;
    }

    redis.set(cachedKey, JSON.stringify(inspiration), "EX", 60);

    res.status(200).json(inspiration);
    return;
  } catch (error) {
    console.error("Error fetching inspiration by slug:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
