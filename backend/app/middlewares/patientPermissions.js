import { ROLES } from '../constants/roles.js';
import { ForbiddenError } from '../utils/errors.js';
import Logger from '../logs/Logger.js';
import Role from '../models/Role.js';

export const canCreatePatient = async (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;
        const targetRoleId = req.body?.roleId;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        const targetRole = await Role.findById(targetRoleId);
        
        if (!targetRole) {
            throw new ForbiddenError('Invalid role specified');
        }

        if (targetRole.name !== ROLES.PATIENT) {
            throw new ForbiddenError('You can only create patient accounts');
        }

        const allowedRoles = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION];

        if (!allowedRoles.includes(requestingUserRole)) {
            Logger.warn(`Unauthorized patient creation attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('You do not have permission to create patient accounts');
        }

        Logger.info(`User with role ${requestingUserRole} creating patient account`);
        next();
    } catch (error) {
        next(error);
    }
};

export const canCreateAnyUser = async (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;
        const targetRoleId = req.body?.roleId;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        const targetRole = await Role.findById(targetRoleId);
        
        if (!targetRole) {
            throw new ForbiddenError('Invalid role specified');
        }

        if (targetRole.name !== ROLES.PATIENT && requestingUserRole !== ROLES.ADMIN) {
            Logger.warn(`Unauthorized ${targetRole.name} creation attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('Only administrators can create staff accounts');
        }

        next();
    } catch (error) {
        next(error);
    }
};
