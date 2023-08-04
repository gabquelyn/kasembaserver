import allowedOrigins from "./allowedOrigins";
import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin as string)) {
      callback(null, true); //first is error which is null and second allow wich is true
    } else {
      callback(new Error("Not allowed by cors"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

export default corsOptions;