import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { generateReport, getReportData } from "../controllers/reportController.js";

const router = express.Router();

router.use(protect);

router.get("/data", getReportData);
router.get("/generate", generateReport);

export default router;

