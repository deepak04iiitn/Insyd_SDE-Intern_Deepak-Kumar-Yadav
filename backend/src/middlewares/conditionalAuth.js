import User from "../models/User.js";
import { protect, restrictToAdmin } from "./authMiddleware.js";
import { errorHandler } from "./errorHandler.js";

// It will allows first user registration without auth
export const conditionalAuth = async (req, res, next) => {

  try {
    const userCount = await User.countDocuments();
    
    // If no users exist, skipping the authentication
    if(userCount === 0) {
      return next();
    }
    
    protect(req, res, (err) => {

      if(err) return next(err);
      restrictToAdmin(req, res, next);

    });

  } catch (error) {
    return next(error);
  }
};

