import User from "../models/User.js";
import PreApprovedEmail from "../models/PreApprovedEmail.js";
import { errorHandler } from "../middlewares/errorHandler.js";

// Getting all the users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {

    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Approving a user by email
export const approveUser = async (req, res, next) => {

  try {

    const { email } = req.body;

    if(!email) {
      return next(errorHandler(400, "Please provide an email address"));
    }

    const user = await User.findOne({ email });

    if(!user) {
      return next(errorHandler(404, "User not found with this email"));
    }

    if(user.isApproved) {
      return next(errorHandler(400, "User is already approved"));
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        },
      },
    });

  } catch (error) {
    next(error);
  }
};


// Rejecting/Deactivating a user
export const rejectUser = async (req, res, next) => {

  try {

    const { email } = req.body;

    if(!email) {
      return next(errorHandler(400, "Please provide an email address"));
    }

    const user = await User.findOne({ email });

    if(!user) {
      return next(errorHandler(404, "User not found with this email"));
    }

    user.isApproved = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User approval revoked successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        },
      },
    });

  } catch (error) {
    next(error);
  }
};


// Getting the pending users 
export const getPendingUsers = async (req, res, next) => {

  try {

    const pendingUsers = await User.find({ 
      isApproved: false,
      role: "user"
    }).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users: pendingUsers,
      },
    });
    
  } catch (error) {
    next(error);
  }
};


// Adding a pre-approved email (user will be auto-approved when they register)
export const addPreApprovedEmail = async (req, res, next) => {

  try {

    const { email } = req.body;

    if(!email) {
      return next(errorHandler(400, "Please provide an email address"));
    }

    const existingPreApproved = await PreApprovedEmail.findOne({ email: email.toLowerCase() });

    if(existingPreApproved) {
      return next(errorHandler(400, "This email is already in the pre-approved list"));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if(existingUser) {

      if(!existingUser.isApproved) {
        existingUser.isApproved = true;
        await existingUser.save();
      }
      
      await PreApprovedEmail.create({
        email: email.toLowerCase(),
        addedBy: req.user.userId,
      });

      return res.status(200).json({
        success: true,
        message: "User already exists and has been approved. Email added to pre-approved list.",
        data: {
          email: email.toLowerCase(),
        },
      });
    }

    const preApprovedEmail = await PreApprovedEmail.create({
      email: email.toLowerCase(),
      addedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Email added to pre-approved list. User will be auto-approved when they register.",
      data: {
        email: preApprovedEmail.email,
        addedAt: preApprovedEmail.createdAt,
      },
    });

  } catch (error) {

    if(error.code === 11000) {
      return next(errorHandler(400, "This email is already in the pre-approved list"));
    }
    next(error);
    
  }
};

