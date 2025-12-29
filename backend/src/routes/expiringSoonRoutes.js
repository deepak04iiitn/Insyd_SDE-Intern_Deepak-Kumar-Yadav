import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getExpiringSoon, getExpired } from "../controllers/expiringSoonController.js";

const router = express.Router();

router.use(protect);

router.get("/expiring-soon", getExpiringSoon);
router.get("/expired", getExpired);

export default router;

