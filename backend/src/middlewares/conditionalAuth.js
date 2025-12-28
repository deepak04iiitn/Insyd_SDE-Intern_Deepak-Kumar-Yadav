import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { errorHandler } from "./errorHandler.js";

dotenv.config();

// It will allows first user registration without auth
// If users exist, requires admin authentication
export const conditionalAuth = async (req, res, next) => {

  try {
    const userCount = await User.countDocuments();
    
    // If no users exist, skip the authentication
    if(userCount === 0) {
      return next();
    }
    
    // If users exist, require admin authentication
    // First verify the token
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

      // Then verify admin role
      const user = await User.findById(req.user.userId);

      if(!user || user.role !== "admin") {
        return next(errorHandler(403, "Access denied. Admin only."));
      }

      next();

    } catch (error) {
      return next(errorHandler(401, "Invalid or expired token"));
    }

  } catch (error) {
    return next(error);
  }
};

