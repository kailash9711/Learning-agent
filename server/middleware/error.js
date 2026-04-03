import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

    // Handle Mongoose Validation Errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(", ");
    }

    // Handle Mongoose Duplicate Key Errors
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }

    // Handle Mongoose Cast Errors
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Resource not found with id of ${err.value}`;
    }

    // Multer and multipart parsing errors
    if (err instanceof multer.MulterError) {
        statusCode = 400;

        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File size is too large. Max limit is 10MB.";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "Unexpected file field. Use multipart/form-data with file field name 'document' or 'file'.";
        } else {
            message = err.message;
        }
    }

    if (err.message === "Field name missing") {
        statusCode = 400;
        message = "Malformed multipart/form-data: file part is missing a field name. Use field name 'document' (or 'file').";
    }

    if (err.message === "Unexpected end of form") {
        statusCode = 400;
        message = "Malformed multipart/form-data: request body ended early. Ensure the upload is sent as multipart/form-data.";
    }

    //jwt error
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired. Please log in again.";
    }

    console.log('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });

};