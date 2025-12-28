import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler 
app.use(globalErrorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
