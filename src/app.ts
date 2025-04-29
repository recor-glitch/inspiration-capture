import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import router from "./routes/routes";
import path from "path";
import { rateLimiter } from "./middlewares/rateLimiter";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(rateLimiter);

app.use("/api", router);

export default app;
