import Logger from '../logs/Logger.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const errorHandler = (error, req, res, next) => {
  
    let statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = error.message || 'Internal Server Error';
    let errors = error.errors;

    if (error.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Validation Error';
        errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
    }

    if (error.code === 11000) {
        statusCode = HTTP_STATUS.CONFLICT;
        const field = Object.keys(error.keyPattern)[0];
        message = `${field} already exists`;
    }

    if (error.name === 'CastError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = `Invalid ${error.path}: ${error.value}`;
    }

    if (error.name === 'JsonWebTokenError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = 'Invalid token';
    }

    if (error.name === 'TokenExpiredError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = 'Token has expired';
    }

    Logger.error('Request error', {
        statusCode,
        message,
        method: req.method,
        url: req.originalUrl,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });

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
