import { ROLES } from '../constants/roles.js';
import { ForbiddenError } from '../utils/errors.js';
import Logger from '../logs/Logger.js';

/**
 * Check if user can create users with specific role
 * Only admin can create users with any role
 */
export const canCreateUserRole = (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;
        const targetRoleId = req.body?.roleId;

        // Check if user is authenticated
        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        // Only admin can create users
        if (requestingUserRole !== ROLES.ADMIN) {
            Logger.warn(`Unauthorized user creation attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('Only administrators can create user accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Check if user can update users with specific role
 * Only admin can update users
 */
export const canUpdateUser = (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        // Only admin can update users
        if (requestingUserRole !== ROLES.ADMIN) {
            Logger.warn(`Unauthorized user update attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('Only administrators can update user accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Check if user can delete users
 * Only admin can delete users
 */
export const canDeleteUser = (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        // Only admin can delete users
        if (requestingUserRole !== ROLES.ADMIN) {
            Logger.warn(`Unauthorized user deletion attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('Only administrators can delete user accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * More granular permission check (for future expansion)
 * Define which roles can create which roles
 */
export const canCreateSpecificRole = (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;
        const targetRoleId = req.body?.roleId;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        // Define role creation permissions
        const roleCreationPermissions = {
            [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.PATIENT],
            [ROLES.DOCTOR]: [], // Doctors cannot create users
            [ROLES.NURSE]: [], // Nurses cannot create users
            [ROLES.RECEPTION]: [], // Reception cannot create users
            [ROLES.PATIENT]: [] // Patients cannot create users
        };

        const allowedRoles = roleCreationPermissions[requestingUserRole] || [];

        // For now, we check against role names
        // In production, you'd verify targetRoleId against the actual role document
        if (allowedRoles.length === 0) {
            Logger.warn(`User with role ${requestingUserRole} attempted to create user`);
            throw new ForbiddenError('You do not have permission to create user accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};
