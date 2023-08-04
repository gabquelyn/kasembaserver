import { format } from "date-fns";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

export const logEvents = async (message: string, logFileName: string) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // check if the logs directory already exists or create a new onw if it doesn't
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fs.promises.mkdir(path.join(__dirname, "..", "logs"));
    }
    // append the log content to the file
    // Note: logs file will be in the dist folder after build
    await fs.promises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

// actual middleware
const logger = (req: Request, res: Response, next: NextFunction) => {
  // call helper function logEvents
  logEvents(
    `${req.method}\t${req.url}\t${req.headers.origin}${req.ip}`,
    "reqLog.log"
  );
  console.log(`${req.method}${req.path}`);
  next();
};

export default logger;
