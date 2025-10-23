import { ROLES } from '../constants/roles.js';
import { ForbiddenError } from '../utils/errors.js';
import Logger from '../logs/Logger.js';
import Role from '../models/Role.js';

/**
 * Check if user can create patient
 * Admin, Doctor, Nurse, and Reception can create patients
 */
export const canCreatePatient = async (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;
        const targetRoleId = req.body?.roleId;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        // Get the target role details
        const targetRole = await Role.findById(targetRoleId);
        
        if (!targetRole) {
            throw new ForbiddenError('Invalid role specified');
        }

        // Only allow creating patient accounts
        if (targetRole.name !== ROLES.PATIENT) {
            throw new ForbiddenError('You can only create patient accounts');
        }

        // Define who can create patients
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

/**
 * Check if user can create any user (admin only)
 */
export const canCreateAnyUser = async (req, res, next) => {
    try {
        const requestingUserRole = req.user?.role;
        const targetRoleId = req.body?.roleId;

        if (!requestingUserRole) {
            throw new ForbiddenError('Authentication required');
        }

        // Get the target role details
        const targetRole = await Role.findById(targetRoleId);
        
        if (!targetRole) {
            throw new ForbiddenError('Invalid role specified');
        }

        // Only admin can create non-patient users
        if (targetRole.name !== ROLES.PATIENT && requestingUserRole !== ROLES.ADMIN) {
            Logger.warn(`Unauthorized ${targetRole.name} creation attempt by role: ${requestingUserRole}`);
            throw new ForbiddenError('Only administrators can create staff accounts');
        }

        // Admin can create anyone, others already checked for patient
        next();
    } catch (error) {
        next(error);
    }
};
