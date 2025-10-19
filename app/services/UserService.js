import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Role from '../models/Role.js';
import BaseService from '../abstractions/BaseServise.js';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors.js';
import Logger from '../logs/Logger.js';

class UserService extends BaseService {
    constructor() {
        super(User);
    }

    /**
     * Create new user (Admin only)
     */
    async createUser(data, requestingUser) {
        // Verify requesting user has admin role
        if (requestingUser.role !== 'admin') {
            throw new ForbiddenError('Only administrators can create user accounts');
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new ConflictError('Email already exists');
        }

        // Check if phone already exists (if provided)
        if (data.phone) {
            const existingPhone = await User.findOne({ phone: data.phone });
            if (existingPhone) {
                throw new ConflictError('Phone number already exists');
            }
        }

        // Verify role exists and get role details
        const role = await Role.findById(data.roleId);
        if (!role) {
            throw new NotFoundError('Role not found');
        }

        if (!role.isActive) {
            throw new BadRequestError('Selected role is not active');
        }

        // Verify admin can create this role (additional security check)
        const allowedRolesToCreate = ['admin', 'doctor', 'nurse', 'reception', 'patient'];
        if (!allowedRolesToCreate.includes(role.name)) {
            throw new ForbiddenError(`Cannot create user with role: ${role.name}`);
        }

        Logger.info(`Admin ${requestingUser.userId} is creating user with role ${role.name}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await User.create({
            email: data.email,
            password: hashedPassword,
            fname: data.fname,
            lname: data.lname,
            phone: data.phone,
            roleId: data.roleId,
            isActive: true
        });

        Logger.info(`User created: ${user.email} with role ${role.name} by admin ${requestingUser.userId}`);

        // Return user without password
        return this.getUserById(user._id);
    }

    /**
     * Get user by ID with role populated
     */
    async getUserById(id) {
        const user = await User.findById(id)
            .select('-password')
            .populate('roleId', 'name description');

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    /**
     * Get all users
     */
    async getAllUsers(options = {}) {
        const {
            role,
            isActive
        } = options;

        const filters = {};
        
        if (role) {
            const roleDoc = await Role.findOne({ name: role });
            if (roleDoc) {
                filters.roleId = roleDoc._id;
            }
        }

        if (typeof isActive !== 'undefined') {
            filters.isActive = isActive;
        }

        const data = await User.find(filters)
            .select('-password')
            .populate('roleId', 'name description')
            .sort({ createdAt: -1 });

        return data;
    }

    /**
     * Update user
     */
    async updateUser(id, data) {
        const user = await User.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Check email uniqueness if changing
        if (data.email && data.email !== user.email) {
            const existingEmail = await User.findOne({ email: data.email });
            if (existingEmail) {
                throw new ConflictError('Email already exists');
            }
        }

        // Check phone uniqueness if changing
        if (data.phone && data.phone !== user.phone) {
            const existingPhone = await User.findOne({ phone: data.phone });
            if (existingPhone) {
                throw new ConflictError('Phone number already exists');
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).select('-password').populate('roleId');

        Logger.info(`User updated: ${updatedUser.email}`);

        return updatedUser;
    }

    /**
     * Delete user (soft delete)
     */
    async deleteUser(id) {
        const user = await User.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        await User.findByIdAndUpdate(id, { isActive: false });

        Logger.info(`User deactivated: ${user.email}`);

        return { message: 'User deactivated successfully' };
    }

    /**
     * Activate user
     */
    async activateUser(id) {
        const user = await User.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        await User.findByIdAndUpdate(id, { isActive: true });

        Logger.info(`User activated: ${user.email}`);

        return { message: 'User activated successfully' };
    }

    /**
     * Change user password
     */
    async changePassword(id, newPassword) {
        const user = await User.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(id, { password: hashedPassword });

        Logger.info(`Password changed for user: ${user.email}`);

        return { message: 'Password changed successfully' };
    }

    /**
     * Get users by role
     */
    async getUsersByRole(roleName) {
        const role = await Role.findOne({ name: roleName });
        if (!role) {
            throw new NotFoundError('Role not found');
        }

        return await User.find({ roleId: role._id, isActive: true })
            .select('-password')
            .populate('roleId');
    }
}

export default UserService;
