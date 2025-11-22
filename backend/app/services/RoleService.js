import Role from '../models/Role.js';
import Logger from '../logs/Logger.js';

class RoleService {
    async getAllRoles() {
        try {
            const roles = await Role.find().sort({ name: 1 });
            return roles;
        } catch (error) {
            Logger.error('Error fetching roles', error);
            throw error;
        }
    }

    async getRoleById(roleId) {
        try {
            const role = await Role.findById(roleId);
            if (!role) {
                throw new Error('Role not found');
            }
            return role;
        } catch (error) {
            Logger.error('Error fetching role by ID', error);
            throw error;
        }
    }

    async createRole(roleData) {
        try {
            const existingRole = await Role.findOne({ name: roleData.name });
            if (existingRole) {
                throw new Error('Role with this name already exists');
            }

            const role = new Role(roleData);
            await role.save();

            Logger.info('Role created successfully', {
                roleId: role._id,
                name: role.name
            });

            return role;
        } catch (error) {
            Logger.error('Error creating role', error);
            throw error;
        }
    }

    async updateRole(roleId, updateData) {
        try {
            const role = await Role.findById(roleId);
            if (!role) {
                throw new Error('Role not found');
            }

            if (updateData.name && updateData.name !== role.name) {
                const existingRole = await Role.findOne({ name: updateData.name });
                if (existingRole) {
                    throw new Error('Role name already in use');
                }
            }

            Object.assign(role, updateData);
            await role.save();

            Logger.info('Role updated successfully', {
                roleId: role._id
            });

            return role;
        } catch (error) {
            Logger.error('Error updating role', error);
            throw error;
        }
    }

    async deleteRole(roleId) {
        try {
            const role = await Role.findById(roleId);
            if (!role) {
                throw new Error('Role not found');
            }

            await role.deleteOne();

            Logger.info('Role deleted successfully', {
                roleId: role._id
            });

            return role;
        } catch (error) {
            Logger.error('Error deleting role', error);
            throw error;
        }
    }

    async updateRolePermissions(roleId, permissions) {
        try {
            const role = await Role.findById(roleId);
            if (!role) {
                throw new Error('Role not found');
            }

            role.permissions = permissions;
            await role.save();

            Logger.info('Role permissions updated successfully', {
                roleId: role._id
            });

            return role;
        } catch (error) {
            Logger.error('Error updating role permissions', error);
            throw error;
        }
    }
}

export default RoleService;
