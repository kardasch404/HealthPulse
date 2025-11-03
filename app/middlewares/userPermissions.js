import { ROLES } from '../constants/roles.js';
import { ForbiddenError } from '../utils/errors.js';
import Logger from '../logs/Logger.js';


export const canCreateUserRole = (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;
        const targetRoleId = req.body?.roleId;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        if (requestingUserRole !== ROLES.ADMIN) {
            Logger.warn(`Unauthorized user creation attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('Only administrators can create user accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};


export const canUpdateUser = (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        if (requestingUserRole !== ROLES.ADMIN) {
            Logger.warn(`Unauthorized user update attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('Only administrators can update user accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};


export const canDeleteUser = (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        if (requestingUserRole !== ROLES.ADMIN) {
            Logger.warn(`Unauthorized user deletion attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('Only administrators can delete user accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const canCreateSpecificRole = (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;
        const targetRoleId = req.body?.roleId;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        const roleCreationPermissions = {
            [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.PATIENT],
            [ROLES.DOCTOR]: [], // Doctors cannot create users
            [ROLES.NURSE]: [], // Nurses cannot create users
            [ROLES.RECEPTION]: [], // Reception cannot create users
            [ROLES.PATIENT]: [] // Patients cannot create users
        };

        const allowedRoles = roleCreationPermissions[requestingUserRole] || [];

        if (allowedRoles.length === 0) {
            Logger.warn(`User with role ${requestingUserRole} attempted to create user`);
            throw new ForbiddenError('You do not have permission to create user accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};
