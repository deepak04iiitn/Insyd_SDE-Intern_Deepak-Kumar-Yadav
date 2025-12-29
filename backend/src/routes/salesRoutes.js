import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getSales, getSalesAnalytics } from "../controllers/salesController.js";

const router = express.Router();

router.use(protect);

router.get("/", getSales);
router.get("/analytics", getSalesAnalytics);

export default router;

