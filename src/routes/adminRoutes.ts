import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyAdmin from "../middlewares/onlyInspectors";

const router = Router();
router.use(verifyJWT, onlyAdmin);

export default router;
