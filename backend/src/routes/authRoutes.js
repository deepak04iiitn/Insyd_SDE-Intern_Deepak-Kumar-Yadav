import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Registration is open to everyone - new users will be created with isApproved: false
// First user automatically becomes admin with isApproved: true
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;

