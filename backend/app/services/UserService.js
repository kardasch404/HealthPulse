import User from '../models/User.js';
import Role from '../models/Role.js';
import bcrypt from 'bcrypt';
import Logger from '../logs/Logger.js';

class UserService {
    async createUser(userData) {
        try {
            const { fname, lname, email, password, phone, roleId } = userData;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User({
                fname,
                lname,
                email,
                password: hashedPassword,
                phone,
                roleId
            });

            await user.save();

            Logger.info('User created successfully', {
                userId: user._id,
                email: user.email
            });

            return user;
        } catch (error) {
            Logger.error('Error creating user', error);
            throw error;
        }
    }

    async getAllUsers(filters = {}, page = 1, limit = 10) {
        try {
            const query = {};
            
            if (filters.role) {
                const role = await Role.findOne({ name: filters.role });
                if (role) {
                    query.roleId = role._id;
                }
            }

            if (filters.isActive !== undefined) {
                query.isActive = filters.isActive;
            }

            if (filters.search) {
                query.$or = [
                    { fname: { $regex: filters.search, $options: 'i' } },
                    { lname: { $regex: filters.search, $options: 'i' } },
                    { email: { $regex: filters.search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;

            const users = await User.find(query)
                .populate('roleId')
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await User.countDocuments(query);

            return {
                users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            };
        } catch (error) {
            Logger.error('Error fetching users', error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const user = await User.findById(userId)
                .populate('roleId')
                .select('-password');

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            Logger.error('Error fetching user by ID', error);
            throw error;
        }
    }

    async getUsersByRole(roleName) {
        try {
            const role = await Role.findOne({ name: roleName });
            if (!role) {
                throw new Error('Role not found');
            }

            const users = await User.find({ roleId: role._id })
                .select('-password')
                .sort({ fname: 1, lname: 1 });

            return users;
        } catch (error) {
            Logger.error('Error fetching users by role', error);
            throw error;
        }
    }

    async updateUser(userId, updateData) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (updateData.email && updateData.email !== user.email) {
                const existingUser = await User.findOne({ email: updateData.email });
                if (existingUser) {
                    throw new Error('Email already in use');
                }
            }

            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            Object.assign(user, updateData);
            await user.save();

            Logger.info('User updated successfully', {
                userId: user._id
            });

            return user;
        } catch (error) {
            Logger.error('Error updating user', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.isActive = false;
            await user.save();

            Logger.info('User deactivated successfully', {
                userId: user._id
            });

            return user;
        } catch (error) {
            Logger.error('Error deactivating user', error);
            throw error;
        }
    }

    async activateUser(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.isActive = true;
            await user.save();

            Logger.info('User activated successfully', {
                userId: user._id
            });

            return user;
        } catch (error) {
            Logger.error('Error activating user', error);
            throw error;
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
            await user.save();

            Logger.info('Password changed successfully', {
                userId: user._id
            });

            return true;
        } catch (error) {
            Logger.error('Error changing password', error);
            throw error;
        }
    }
}

export default UserService;
