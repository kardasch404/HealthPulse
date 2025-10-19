import BaseController from '../abstractions/BaseController.js';
import UserValidator from '../validators/UserValidator.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class UserController extends BaseController {
    constructor(userService) {
        super();
        this.userService = userService;
    }

    /**
     * Create new user (Admin only)
     */
    async createUser(req, res) {
        // Validate input
        const validatedData = UserValidator.validateCreateUser(req.body);

        // Get requesting user from JWT token (set by authenticate middleware)
        const requestingUser = req.user;

        // Create user with permission check
        const user = await this.userService.createUser(validatedData, requestingUser);

        // Send response
        return this.handleSuccess(res, {
            message: 'User created successfully',
            data: user
        }, HTTP_STATUS.CREATED);
    }

    /**
     * Get all users with pagination
     */
    async getAllUsers(req, res) {
        const { page, limit, role, isActive } = req.query;

        const result = await this.userService.getAllUsers({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            role,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
        });

        return this.handleSuccess(res, {
            message: 'Users retrieved successfully',
            data: result.data,
            pagination: result.pagination
        });
    }

    /**
     * Get user by ID
     */
    async getUserById(req, res) {
        const { id } = req.params;

        const user = await this.userService.getUserById(id);

        return this.handleSuccess(res, {
            message: 'User retrieved successfully',
            data: user
        });
    }

    /**
     * Update user
     */
    async updateUser(req, res) {
        const { id } = req.params;
        
        // Validate input
        const validatedData = UserValidator.validateUpdateUser(req.body);

        // Update user
        const user = await this.userService.updateUser(id, validatedData);

        return this.handleSuccess(res, {
            message: 'User updated successfully',
            data: user
        });
    }

    /**
     * Delete user (soft delete)
     */
    async deleteUser(req, res) {
        const { id } = req.params;

        await this.userService.deleteUser(id);

        return this.handleSuccess(res, {
            message: 'User deactivated successfully'
        });
    }

    /**
     * Activate user
     */
    async activateUser(req, res) {
        const { id } = req.params;

        await this.userService.activateUser(id);

        return this.handleSuccess(res, {
            message: 'User activated successfully'
        });
    }

    /**
     * Get users by role
     */
    async getUsersByRole(req, res) {
        const { role } = req.params;

        const users = await this.userService.getUsersByRole(role);

        return this.handleSuccess(res, {
            message: `${role} users retrieved successfully`,
            data: users
        });
    }
}

export default UserController;
