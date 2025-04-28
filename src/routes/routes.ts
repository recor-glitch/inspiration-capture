import express from "express";
import {
  AddInspiration,
  GetAllInspiration,
  GetInspirationBySlug,
  GetInspirationFromURL,
} from "../controllers/inspiration-controller";

const router = express.Router();

router.post("/", GetInspirationFromURL);
router.post("/inspiration", AddInspiration);
router.get("/inspiration", GetAllInspiration);
router.get("/inspiration/:slug", GetInspirationBySlug);

export default router;
