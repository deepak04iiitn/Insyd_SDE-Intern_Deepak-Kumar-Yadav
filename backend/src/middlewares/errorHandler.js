export const errorHandler = (statusCode, message) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.message = message;

  return error;
};

// Global error handling middleware
export const globalErrorHandler = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handling validation errors
  if(err.name === "ValidationError") {
    err.statusCode = 400;
    err.message = Object.values(err.errors).map(val => val.message).join(", ");
  }

  // Handling duplicate key errors of mongo
  if(err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    err.statusCode = 400;
    err.message = `${field} already exists`;
  }

  // Handling JWT errors
  if(err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.message = "Invalid token";
  }

  if(err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.message = "Token expired";
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

};

