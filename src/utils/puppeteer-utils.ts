import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export const GetScreenshot = async (
  url: string
): Promise<{ mobile: string; desktop: string }> => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const screenshotsDir = path.resolve(__dirname, "../../public/screenshots");

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const timestamp = Date.now(); // Use one timestamp for both files

  const desktopFileName = `${timestamp}-desktop.png`;
  const screenshotDesktopPath = path.join(screenshotsDir, desktopFileName);

  await page.setViewport({ width: 1920, height: 1080 });
  await page.screenshot({
    path: screenshotDesktopPath,
    fullPage: true,
  });

  await page.setViewport({ width: 375, height: 812, isMobile: true });
  const mobileFileName = `${timestamp}-mobile.png`;
  const screenshotMobilePath = path.join(screenshotsDir, mobileFileName);

  await page.screenshot({
    path: screenshotMobilePath,
    fullPage: true,
  });

  await browser.close();

  return {
    desktop: `${process.env.BASE_URL}/public/screenshots/${desktopFileName}`,
    mobile: `${process.env.BASE_URL}/public/screenshots/${mobileFileName}`,
  };
};
