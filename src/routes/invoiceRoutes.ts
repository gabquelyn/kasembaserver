import verifyJWT from "../middlewares/verifyJWT";
import { Router } from "express";
import onlyInspectors from "../middlewares/onlyInspectors";
import onlyAdmin from "../middlewares/onlyAdmin";
import {
  generateInvoice,
  getInvoices,
  getInvoice,
  completeInvoice,
} from "../controllers/invoiceController";
const router = Router();
router.use(verifyJWT);
router.route("/").post(onlyInspectors, generateInvoice).get(getInvoices);
router.route("/:invoiceId").get(getInvoice).post(onlyAdmin, completeInvoice);
export default router;
