import Logger from '../logs/Logger.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (error, req, res, next) => {
  
    let statusCode = error.statusCode ;
    let message = error.message ;
    let errors = error.errors;

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Validation Error';
        errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
    }

    // Handle Mongoose duplicate key errors
    if (error.code === 11000) {
        statusCode = HTTP_STATUS.CONFLICT;
        const field = Object.keys(error.keyPattern)[0];
        message = `${field} already exists`;
    }

    // Handle Mongoose cast errors
    if (error.name === 'CastError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = `Invalid ${error.path}: ${error.value}`;
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = 'Invalid token';
    }

    if (error.name === 'TokenExpiredError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = 'Token has expired';
    }

    // Log the error
    Logger.error('Request error', {
        statusCode,
        message,
        method: req.method,
        url: req.originalUrl,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });

    // Send error response
    const response = {
        success: false,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && { 
            stack: error.stack,
            error: error 
        })
    };

    res.status(statusCode).json(response);
};


export const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
