import BaseController from '../abstractions/BaseController.js';
import Logger from '../logs/Logger.js';
import { ROLES } from '../constants/roles.js';

class RoleController extends BaseController {
    constructor(roleService) {
        super();
        this.roleService = roleService;
    }

    async getAllRoles(req, res) {
        try {
            // Check if user is admin
            if (req.user?.role !== ROLES.ADMIN) {
                return this.handleError(res, {
                    message: 'Unauthorized: Admin access required',
                    statusCode: 403
                });
            }

            const roles = await this.roleService.getAllRoles();
            return this.handleSuccess(res, {
                message: 'Roles retrieved successfully',
                data: roles
            });
        } catch (error) {
            Logger.error('Error getting roles:', error);
            return this.handleError(res, {
                message: 'Error retrieving roles',
                error: error.message
            });
        }
    }

    async getRoleById(req, res) {
        try {
            if (req.user?.role !== ROLES.ADMIN) {
                return this.handleError(res, {
                    message: 'Unauthorized: Admin access required',
                    statusCode: 403
                });
            }

            const { id } = req.params;
            const role = await this.roleService.getRoleById(id);

            if (!role) {
                return this.handleError(res, {
                    message: 'Role not found',
                    statusCode: 404
                });
            }

            return this.handleSuccess(res, {
                message: 'Role retrieved successfully',
                data: role
            });
        } catch (error) {
            Logger.error('Error getting role:', error);
            return this.handleError(res, {
                message: 'Error retrieving role',
                error: error.message
            });
        }
    }

    async createRole(req, res) {
        try {
            if (req.user?.role !== ROLES.ADMIN) {
                return this.handleError(res, {
                    message: 'Unauthorized: Admin access required',
                    statusCode: 403
                });
            }

            const role = await this.roleService.createRole(req.body);
            return this.handleSuccess(res, {
                message: 'Role created successfully',
                data: role
            });
        } catch (error) {
            Logger.error('Error creating role:', error);
            return this.handleError(res, {
                message: 'Error creating role',
                error: error.message
            });
        }
    }

    async updateRole(req, res) {
        try {
            if (req.user?.role !== ROLES.ADMIN) {
                return this.handleError(res, {
                    message: 'Unauthorized: Admin access required',
                    statusCode: 403
                });
            }

            const { id } = req.params;
            const role = await this.roleService.updateRole(id, req.body);

            if (!role) {
                return this.handleError(res, {
                    message: 'Role not found',
                    statusCode: 404
                });
            }

            return this.handleSuccess(res, {
                message: 'Role updated successfully',
                data: role
            });
        } catch (error) {
            Logger.error('Error updating role:', error);
            return this.handleError(res, {
                message: 'Error updating role',
                error: error.message
            });
        }
    }

    async deleteRole(req, res) {
        try {
            if (req.user?.role !== ROLES.ADMIN) {
                return this.handleError(res, {
                    message: 'Unauthorized: Admin access required',
                    statusCode: 403
                });
            }

            const { id } = req.params;
            const result = await this.roleService.deleteRole(id);

            if (!result) {
                return this.handleError(res, {
                    message: 'Role not found',
                    statusCode: 404
                });
            }

            return this.handleSuccess(res, {
                message: 'Role deleted successfully'
            });
        } catch (error) {
            Logger.error('Error deleting role:', error);
            return this.handleError(res, {
                message: 'Error deleting role',
                error: error.message
            });
        }
    }

    async updateRolePermissions(req, res) {
        try {
            if (req.user?.role !== ROLES.ADMIN) {
                return this.handleError(res, {
                    message: 'Unauthorized: Admin access required',
                    statusCode: 403
                });
            }

            const { id } = req.params;
            const { permissions } = req.body;

            const role = await this.roleService.updateRolePermissions(id, permissions);

            if (!role) {
                return this.handleError(res, {
                    message: 'Role not found',
                    statusCode: 404
                });
            }

            return this.handleSuccess(res, {
                message: 'Role permissions updated successfully',
                data: role
            });
        } catch (error) {
            Logger.error('Error updating role permissions:', error);
            return this.handleError(res, {
                message: 'Error updating role permissions',
                error: error.message
            });
        }
    }
}

export default RoleController;
