import JWTUtil from '../utils/jwt.js';
import Logger from '../logs/Logger.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            Logger.warn('No token provided');
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication token is required'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = JWTUtil.verifyAccessToken(token);
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    } catch (error) {
        Logger.error('Auth middleware error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Token has expired'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid token'
            });
        }

        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};