import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import expiringSoonRoutes from "./routes/expiringSoonRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import { startExpiryCheckJob } from "./jobs/expiryCheckJob.js";

dotenv.config();

connectDB();

startExpiryCheckJob();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/expiring-soon", expiringSoonRoutes);
app.use("/api/reports", reportRoutes);

app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Global error handler 
app.use(globalErrorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
