import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getAvailableStock, getOutOfStock, addStock, updateStock, deleteStock, getStockById } from "../controllers/stockController.js";

const router = express.Router();

router.use(protect);

router.get("/available", getAvailableStock);
router.get("/out-of-stock", getOutOfStock);
router.get("/:id", getStockById);
router.post("/", addStock);
router.put("/:id", updateStock);
router.delete("/:id", deleteStock);

export default router;

