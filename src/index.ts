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
import invoiceRoutes from "./routes/invoiceRoutes";
import paymentRoutes from "./routes/paymentRoute";

dotenv.config();
connectDB();
const app: Express = express();
const port = process.env.PORT || 8080;

app.use(logger);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
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
app.use("/invoice", invoiceRoutes);


app.use("/", (req: Request, res: Response) => {
  res.status(200).json({ messge: "Welcome to Karsemba server!" });
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
