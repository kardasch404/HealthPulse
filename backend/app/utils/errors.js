import { HTTP_STATUS } from '../constants/statusCodes.js';

/**
 * Base Application Error
 */
class AppError extends Error {
    constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Bad Request Error (400)
 */
class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, HTTP_STATUS.BAD_REQUEST);
    }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, HTTP_STATUS.UNAUTHORIZED);
    }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, HTTP_STATUS.FORBIDDEN);
    }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, HTTP_STATUS.NOT_FOUND);
    }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, HTTP_STATUS.CONFLICT);
    }
}

/**
 * Validation Error (400)
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, HTTP_STATUS.BAD_REQUEST);
        this.errors = errors;
    }
}

export {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError
};
