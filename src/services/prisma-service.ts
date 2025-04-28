import { InspirationData } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const SaveInspiration = async (inspirations: InspirationData[]) => {
  try {
    const savedInspiration = await prisma.inspiration.createMany({
      data: inspirations,
    });
    return savedInspiration;
  } catch (error) {
    console.error("Error saving inspiration:", error);
    throw new Error("Failed to save inspiration");
  }
};

export const GetAllInspirationFromDB = async ({
  skip,
  limit,
}: {
  skip: number;
  limit: number;
}) => {
  try {
    const inspirations = await prisma.inspiration.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    return inspirations;
  } catch (error) {
    console.error("Error fetching inspirations:", error);
    throw new Error("Failed to fetch inspirations");
  }
};

export const GetInspirationFromDBBySlug = async (slug: string) => {
  try {
    const inspiration = await prisma.inspiration.findUnique({
      where: {
        slug: slug,
      },
    });
    return inspiration;
  } catch (error) {
    console.error("Error fetching inspiration by slug:", error);
    throw new Error("Failed to fetch inspiration by slug");
  }
};
