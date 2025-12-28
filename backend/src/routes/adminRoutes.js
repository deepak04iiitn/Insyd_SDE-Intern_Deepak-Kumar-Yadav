import express from "express";
import { protect, restrictToAdmin } from "../middlewares/authMiddleware.js";
import { getAllUsers, approveUser, rejectUser, getPendingUsers, addPreApprovedEmail } from "../controllers/adminController.js";

const router = express.Router();

router.use(protect);
router.use(restrictToAdmin);

router.get("/users", getAllUsers);
router.get("/users/pending", getPendingUsers);
router.post("/users/approve", approveUser);
router.post("/users/reject", rejectUser);
router.post("/users/pre-approve", addPreApprovedEmail);

export default router;

