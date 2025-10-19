import BaseService from '../abstractions/BaseServise.js';
import Role from '../models/Role.js';
import Logger from '../logs/Logger.js';

class RoleService extends BaseService {
    constructor() {
        super(Role);
    }

    async getAllRoles() {
        try {
            return await Role.find({ isActive: true });
        } catch (error) {
            Logger.error('Error in getAllRoles service:', error);
            throw error;
        }
    }

    async getRoleById(id) {
        try {
            return await Role.findById(id);
        } catch (error) {
            Logger.error('Error in getRoleById service:', error);
            throw error;
        }
    }

    async createRole(data) {
        try {
            const role = new Role({
                name: data.name,
                description: data.description,
                permissions: data.permissions,
                isActive: true
            });
            return await role.save();
        } catch (error) {
            Logger.error('Error in createRole service:', error);
            throw error;
        }
    }

    async updateRole(id, data) {
        try {
            return await Role.findByIdAndUpdate(
                id,
                {
                    $set: {
                        name: data.name,
                        description: data.description,
                        permissions: data.permissions
                    }
                },
                { new: true }
            );
        } catch (error) {
            Logger.error('Error in updateRole service:', error);
            throw error;
        }
    }

    async deleteRole(id) {
        try {
            // Soft delete by setting isActive to false
            return await Role.findByIdAndUpdate(
                id,
                { $set: { isActive: false } },
                { new: true }
            );
        } catch (error) {
            Logger.error('Error in deleteRole service:', error);
            throw error;
        }
    }

    async updateRolePermissions(id, permissions) {
        try {
            return await Role.findByIdAndUpdate(
                id,
                { $set: { permissions } },
                { new: true }
            );
        } catch (error) {
            Logger.error('Error in updateRolePermissions service:', error);
            throw error;
        }
    }

    async getRoleByName(name) {
        try {
            return await Role.findOne({ name, isActive: true });
        } catch (error) {
            Logger.error('Error in getRoleByName service:', error);
            throw error;
        }
    }
}

export default RoleService;
