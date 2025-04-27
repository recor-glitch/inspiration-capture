import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import inspirationRoutes from "./routes/inspirationRoutes";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", inspirationRoutes);

export default app;
