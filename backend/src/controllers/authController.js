import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import { errorHandler } from "../middlewares/errorHandler.js";

dotenv.config();

const generateToken = (userId) => {
  
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};


// Register User
export const register = async (req, res, next) => {
  try {

    const { name, email, password, role } = req.body;

    if(!name || !email || !password) {
      return next(errorHandler(400, "Please provide name, email, and password"));
    }

    const existingUser = await User.findOne({ email });

    if(existingUser) {
      return next(errorHandler(400, "User already exists with this email"));
    }

    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    let userRole = role || "user";

    if(isFirstUser) {
      userRole = "admin";
    } else {
      userRole = "user";
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: isFirstUser
        ? "First admin user created successfully"
        : "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Login User
export const login = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    if(!email || !password) {
      return next(errorHandler(400, "Please provide email and password"));
    }

    const user = await User.findOne({ email }).select("+password");

    if(!user) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    if(!user.isActive) {
      return next(errorHandler(401, "Your account has been deactivated"));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(!isPasswordCorrect) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });

  } catch (error) {
    next(error);
  }
};


// Getting the Current User
export const getMe = async (req, res, next) => {
  try {

    const user = await User.findById(req.user.userId);

    if(!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

  } catch (error) {
    next(error);
  }
};

