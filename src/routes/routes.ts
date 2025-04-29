import express from "express";
import {
  AddInspiration,
  GetAllInspiration,
  GetInspirationBySlug,
  GetInspirationFromURL,
} from "../controllers/inspiration-controller";
import { generateToken } from "../controllers/auth-controller";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/login", generateToken);

router.post("/", verifyToken, GetInspirationFromURL);
router.post("/inspiration", verifyToken, AddInspiration);
router.get("/inspiration", verifyToken, GetAllInspiration);
router.get("/inspiration/:slug", verifyToken, GetInspirationBySlug);

export default router;
