import puppeteer from "puppeteer";
import { InspirationData } from "../types";
import { GetScreenshot } from "../utils/puppeteer-utils";

export function extractLinksFromPage(url: string): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });

      const links = await page.evaluate(() => {
        const anchorTags = Array.from(document.querySelectorAll("a"));
        return anchorTags.map((anchor) => anchor.href);
      });

      await browser.close();
      resolve(links);
    } catch (error) {
      reject(error);
    }
  });
}

export async function extractLinkDetails(
  url: string
): Promise<InspirationData> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const data: InspirationData = await page.evaluate(async () => {
      const title = document.title || "No title found";
      const description =
        document
          .querySelector("meta[name='description']")
          ?.getAttribute("content") || "No description found";
      const websiteLink = window.location.href;
      const desktopScreenshot = "";
      const mobileScreenshot = "";
      const colorScheme =
        getComputedStyle(document.body).backgroundColor ||
        "No color scheme found";
      const fontsSet = new Set<string>();
      document.querySelectorAll("*").forEach((el) => {
        const font = getComputedStyle(el).fontFamily;
        if (font) fontsSet.add(font);
      });
      const fonts = Array.from(fontsSet);
      const technologyStack: string[] = [];
      const categories: string[] = [];
      const niche = "";
      const slug =
        (document.title || window.location.href)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") +
        "-" +
        Date.now();
      const metaTitle = "";
      const metaDescription =
        document
          .querySelector("meta[name='description']")
          ?.getAttribute("content") || "No description found";

      return {
        title,
        description,
        websiteLink,
        desktopScreenshot,
        mobileScreenshot,
        colorScheme,
        fonts,
        technologyStack,
        categories,
        niche,
        slug,
        metaTitle,
        metaDescription,
      };
    });

    await browser.close();

    const { desktop, mobile } = await GetScreenshot(url);
    return { ...data, desktopScreenshot: desktop, mobileScreenshot: mobile };
  } catch (error) {
    throw error;
  }
}
