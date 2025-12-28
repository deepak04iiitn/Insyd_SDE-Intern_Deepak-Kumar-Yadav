import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from 'dotenv';
import { errorHandler } from "./errorHandler.js";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    let token;

    // console.log("Authorization header:", req.headers.authorization);

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // console.log("Token extracted:", token ? "Token exists" : "No token");

    if(!token) {
      // console.log("No token found - sending 401");
      return next(errorHandler(401, "Not authorized to access this route"));
    }

    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("Token decoded successfully. User ID:", decoded.userId);
      req.user = decoded;
      next();

    } catch (error) {
      // console.log("Token verification failed:", error.message);
      return next(errorHandler(401, "Invalid or expired token"));
    }

  } catch (error) {
    // console.log("Protect middleware error:", error);
    next(error);
  }
};


// Restricting to admin only
export const restrictToAdmin = async (req, res, next) => {
  try {

    // console.log("Checking admin access for user ID:", req.user?.userId);

    const user = await User.findById(req.user.userId);

    // console.log("User found:", user ? `${user.name} (${user.role})` : "No user");

    if(!user || user.role !== "admin") {
      // console.log("Access denied - not an admin");
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    // console.log("Admin access granted");
    next();
    
  } catch (error) {
    // console.log("restrictToAdmin error:", error);
    next(error);
  }
};
