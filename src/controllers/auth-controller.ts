import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecret"; // Store securely

export const generateToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, password } = req.body;

  // For demo: hardcoded check. Replace with real DB lookup in production.
  if (username === "admin" && password === "password123") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).json({ token });
    return;
  }

  res.status(401).json({ error: "Invalid credentials" });
};
