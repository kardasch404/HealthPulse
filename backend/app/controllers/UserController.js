import BaseController from '../abstractions/BaseController.js';
import UserValidator from '../validators/UserValidator.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class UserController extends BaseController {
    constructor(userService) {
        super();
        this.userService = userService;
    }

    async createUser(req, res) {
    
        const validatedData = UserValidator.validateCreateUser(req.body);
        const requestingUser = req.user;

        const user = await this.userService.createUser(validatedData, requestingUser);

        return this.handleSuccess(res, {
            message: 'User created successfully',
            data: user
        }, HTTP_STATUS.CREATED);
    }


    async getAllUsers(req, res) {
        const { role, isActive, search } = req.query;
        const users = await this.userService.getAllUsers({
            role,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            search
        });

        return this.handleSuccess(res, {
            message: search ? 'Search results' : 'Users retrieved successfully',
            data: users
        });
    }

 
    async getUserById(req, res) {
        const { id } = req.params;

        const user = await this.userService.getUserById(id);

        return this.handleSuccess(res, {
            message: 'User retrieved successfully',
            data: user
        });
    }


    async updateUser(req, res) {
        const { id } = req.params;
        
        const validatedData = UserValidator.validateUpdateUser(req.body);
        const user = await this.userService.updateUser(id, validatedData);

        return this.handleSuccess(res, {
            message: 'User updated successfully',
            data: user
        });
    }

   
    async deleteUser(req, res) {
        const { id } = req.params;

        await this.userService.deleteUser(id);

        return this.handleSuccess(res, {
            message: 'User deactivated successfully'
        });
    }

 
    async activateUser(req, res) {
        const { id } = req.params;

        await this.userService.activateUser(id);

        return this.handleSuccess(res, {
            message: 'User activated successfully'
        });
    }


    async getUsersByRole(req, res) {
        const { role } = req.params;

        const users = await this.userService.getUsersByRole(role);

        return this.handleSuccess(res, {
            message: `${role} users retrieved successfully`,
            data: users
        });
    }

    async getCurrentUser(req, res) {
        const userId = req.user.userId; // From JWT token

        const user = await this.userService.getUserById(userId);

        return this.handleSuccess(res, {
            message: 'Profile retrieved successfully',
            data: user
        });
    }

    async updateCurrentUser(req, res) {
        const userId = req.user.userId; // From JWT token
        
        const allowedFields = ['fname', 'lname', 'phone', 'email'];
        const updateData = {};
        
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        const validatedData = UserValidator.validateUpdateUser(updateData);
        const user = await this.userService.updateUser(userId, validatedData);

        return this.handleSuccess(res, {
            message: 'Profile updated successfully',
            data: user
        });
    }

    async changePassword(req, res) {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return this.handleError(res, {
                message: 'Current password and new password are required',
                statusCode: HTTP_STATUS.BAD_REQUEST
            });
        }

        if (newPassword.length < 6) {
            return this.handleError(res, {
                message: 'New password must be at least 6 characters long',
                statusCode: HTTP_STATUS.BAD_REQUEST
            });
        }

        await this.userService.changePassword(userId, currentPassword, newPassword);

        return this.handleSuccess(res, {
            message: 'Password changed successfully'
        });
    }
}

export default UserController;
