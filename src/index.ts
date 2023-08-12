import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import logger from "./middlewares/logger";
import errorHandler from "./middlewares/errorHandler";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import connectDB from "./config/dbConnect";
import cookieParser from 'cookie-parser';
import mongoose from "mongoose";
import authRoute from './routes/authRoutes'
import { logEvents } from "./middlewares/logger";


dotenv.config();
connectDB();
const app: Express = express();
const port = process.env.PORT || 8080;

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "public")));
app.use('/auth', authRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Express and typescript server");
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
