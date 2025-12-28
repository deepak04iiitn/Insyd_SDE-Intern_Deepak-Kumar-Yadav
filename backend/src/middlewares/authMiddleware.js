import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from 'dotenv';
import { errorHandler } from "./errorHandler.js";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if(!token) {
      return next(errorHandler(401, "Not authorized to access this route"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return next(errorHandler(401, "Invalid or expired token"));
    }

  } catch (error) {
    next(error);
  }
};


// Restricting to admin only
export const restrictToAdmin = async (req, res, next) => {
  try {

    const user = await User.findById(req.user.userId);

    if(!user || user.role !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    next();
    
  } catch (error) {
    next(error);
  }
};

