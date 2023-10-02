import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyInspectors from "../middlewares/onlyInspectors";

const router = Router();
router.use(verifyJWT, onlyInspectors)


export default router;