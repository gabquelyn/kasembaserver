import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import logger from "./middlewares/logger";
import errorHandler from "./middlewares/errorHandler";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import connectDB from "./config/dbConnect";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoute from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import profileRoutes from "./routes/profileRoutes";
import { logEvents } from "./middlewares/logger";
import inspectionsRoutes from "./routes/inspectionRoutes";
import carRoutes from "./routes/carRoutes";
import reportsRoutes from "./routes/reportsRoute";
import inspectorRoutes from "./routes/inspectorRoutes";
import { checkDistance } from "./utils/findLocation";
import paymentRoutes from "./routes/paymentRoute";
import axios from "axios";
dotenv.config();
connectDB();
const app: Express = express();
const port = process.env.PORT || 8080;

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "../images")));
app.use("/auth", authRoute);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/inspector", inspectorRoutes);
app.use("/car", carRoutes);
app.use("/inspection", inspectionsRoutes);
app.use("/reports", reportsRoutes);
app.use("/pay", paymentRoutes);

// trying the distance calculation
app.get("/", async (req: Request, res: Response) => {
  try {
    const sourceRes = await axios.get(
      `https://api.geocod.io/v1.7/geocode?postal_code=80202&api_key=${process.env.GEOCODIO_API_KEY}`
    );
    if (sourceRes.data.results.length > 0) {
      const distance = await checkDistance(
        99950,
        sourceRes.data.results[0].location
      );
      return res.status(200).json({ message: distance });
    }
  } catch (err) {
    console.log(err);
  }
});

app.use(errorHandler);
mongoose.connection.once("open", () => {
  console.log("Connected to database");
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
