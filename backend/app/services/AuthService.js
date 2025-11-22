import User from '../models/User.js';
import Role from '../models/Role.js';
import RefreshToken from '../models/RefreshToken.js';
import bcrypt from 'bcrypt';
import JWTUtil from '../utils/jwt.js';
import Logger from '../logs/Logger.js';
import { LOG_ACTIONS } from '../logs/logLevels.js';

class AuthService {
    async register(userData) {
        try {
            const { fname, lname, email, password } = userData;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const patientRole = await Role.findOne({ name: 'patient' });
            if (!patientRole) {
                throw new Error('Default role not found');
            }

            const user = new User({
                fname,
                lname,
                email,
                password: hashedPassword,
                roleId: patientRole._id
            });

            await user.save();

            Logger.info(LOG_ACTIONS.USER_CREATED, {
                userId: user._id,
                email: user.email
            });

            return user;
        } catch (error) {
            Logger.error(LOG_ACTIONS.REGISTRATION_FAILED, error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            const { email, password } = credentials;

            const user = await User.findOne({ email }).populate('roleId');
            if (!user) {
                throw new Error('Invalid email or password');
            }

            if (!user.isActive) {
                throw new Error('Account is inactive');
            }

            const isPasswordValid = await user.verifyPassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            const accessToken = JWTUtil.generateAccessToken(user._id.toString(), user.roleId.name);
            const refreshToken = JWTUtil.generateRefreshToken(user._id.toString());

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await RefreshToken.create({
                userId: user._id,
                token: refreshToken,
                expiresAt
            });

            user.lastLogin = new Date();
            await user.save();

            Logger.info(LOG_ACTIONS.USER_LOGIN, {
                userId: user._id,
                email: user.email
            });

            return {
                user: {
                    _id: user._id,
                    email: user.email,
                    fname: user.fname,
                    lname: user.lname,
                    phone: user.phone,
                    roleId: {
                        _id: user.roleId._id,
                        name: user.roleId.name,
                        permissions: user.roleId.permissions
                    },
                    isActive: user.isActive,
                    lastLogin: user.lastLogin
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            };
        } catch (error) {
            Logger.error(LOG_ACTIONS.LOGIN_FAILED, error);
            throw error;
        }
    }

    async refreshToken(refreshToken) {
        try {
            const decoded = JWTUtil.verifyRefreshToken(refreshToken);

            const storedToken = await RefreshToken.findOne({ 
                token: refreshToken,
                userId: decoded.userId 
            });

            if (!storedToken) {
                throw new Error('Invalid refresh token');
            }

            if (storedToken.isExpired()) {
                await RefreshToken.deleteOne({ _id: storedToken._id });
                throw new Error('Refresh token expired');
            }

            const user = await User.findById(decoded.userId).populate('roleId');
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }

            const newAccessToken = JWTUtil.generateAccessToken(user._id.toString(), user.roleId.name);
            const newRefreshToken = JWTUtil.generateRefreshToken(user._id.toString());

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await RefreshToken.deleteOne({ _id: storedToken._id });
            await RefreshToken.create({
                userId: user._id,
                token: newRefreshToken,
                expiresAt
            });

            Logger.info(LOG_ACTIONS.TOKEN_REFRESHED, {
                userId: user._id
            });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            Logger.error(LOG_ACTIONS.TOKEN_REFRESH_FAILED, error);
            throw error;
        }
    }

    async logout(userId) {
        try {
            await RefreshToken.deleteMany({ userId });

            Logger.info(LOG_ACTIONS.USER_LOGOUT, {
                userId
            });
        } catch (error) {
            Logger.error(LOG_ACTIONS.LOGOUT_FAILED, error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const user = await User.findById(userId).populate('roleId');
            if (!user) {
                throw new Error('User not found');
            }

            return {
                _id: user._id,
                email: user.email,
                fname: user.fname,
                lname: user.lname,
                phone: user.phone,
                roleId: {
                    _id: user.roleId._id,
                    name: user.roleId.name,
                    permissions: user.roleId.permissions
                },
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            };
        } catch (error) {
            Logger.error('Error fetching user', error);
            throw error;
        }
    }

    async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const isPasswordValid = await user.verifyPassword(oldPassword);
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            await RefreshToken.deleteMany({ userId });

            Logger.info('Password changed successfully', {
                userId
            });
        } catch (error) {
            Logger.error('Error changing password', error);
            throw error;
        }
    }
}

export default AuthService;
