import rateLimiter from "express-rate-limit";
import { logEvents } from "./logger";

const loginLimiter = rateLimiter({
  windowMs: 60 * 1000, //on eminute
  max: 5, //limits window to 5 login attempts per window
  message: {
    message: "Too many attemps from this IP please try again in 60 seconds",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too many requests: ${options.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errorLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, //defaults recommendations
  legacyHeaders: false,
});

export default loginLimiter;
 