import { ROLE_PERMISSIONS } from '../constants/roles.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import Logger from '../logs/Logger.js';

export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;
            
            if (!userRole) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
                    success: false, 
                    message: 'Authentication required'
                });
            }

            const permissions = ROLE_PERMISSIONS[userRole];
            
            if (!permissions || !permissions.includes(requiredPermission)) {
                Logger.warn(`Access denied: User role ${userRole} does not have permission ${requiredPermission}`);
                return res.status(HTTP_STATUS.FORBIDDEN).json({ 
                    success: false, 
                    message: 'You do not have permission to perform this action'
                });
            }

            next();
        } catch (error) {
            Logger.error('Permission middleware error:', error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
};

export const requireAdmin = (req, res, next) => {
    try {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (userRole !== 'admin') {
            Logger.warn(`Admin access denied for user role: ${userRole}`);
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        Logger.error('Admin check middleware error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error checking admin access'
        });
    }
};

export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!allowedRoles.includes(userRole)) {
                Logger.warn(`Access denied: User role ${userRole} not in allowed roles: ${allowedRoles.join(', ')}`);
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'You do not have permission to access this resource'
                });
            }

            next();
        } catch (error) {
            Logger.error('Role check middleware error:', error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error checking role access'
            });
        }
    };
};
