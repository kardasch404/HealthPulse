import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Role from '../models/Role.js';
import BaseService from '../abstractions/BaseServise.js';
import Logger from '../logs/Logger.js';
import JWTUtil from '../utils/jwt.js';

class AuthService extends BaseService {
    constructor() {
        super(User);
    }

    async register (data)
    {
        try{
         
            const hashedPassword = await bcrypt.hash(data.password, 10);

            let patientRole = await Role.findOne({ name: 'patient' });
            if (!patientRole) {
                patientRole = await Role.create({
                    name: 'patient',
                    description: 'Default patient role',
                    isActive: true
                });
            }

            const image = 'default-image.png';
            const userData = {
                fname: data.fname,
                lname: data.lname,
                email: data.email,
                image: image,
                password: hashedPassword,
                birthDate: data.birthDate,
                role: patientRole._id,
            };

            if (data.phone) userData.phone = data.phone;
            if (data.cni) userData.cni = data.cni;

            const user = await User.create(userData);

            return user;

        }catch(error)
        {
            Logger.error('Error in register service:', error);
            throw new Error('Error registering user: ' + error.message);
        }
    }

    async login (data)
    {
        try {
            const { email, password } = data;
            
            const user = await User.findOne({ email }).populate('roleId');
            if (!user) {
                throw new Error('User not found');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid password');
            }

            const accessToken = JWTUtil.generateAccessToken(user._id, user.roleId.name);
            const refreshToken = JWTUtil.generateRefreshToken(user._id);
            user.lastLogin = new Date();
            await user.save();

            return {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    fname: user.fname,
                    lname: user.lname,
                    email: user.email,
                    role: user.roleId.name
                }
            };

        } catch (error) {
            Logger.error('Error in login service:', error);
            throw new Error('Error logging in user: ' + error.message);
        }
    }

    async refreshToken (refreshToken)
    {
        try {
            const decoded = JWTUtil.verifyRefreshToken(refreshToken);
            
            const user = await User.findById(decoded.userId).populate('role');
            if (!user) {
                throw new Error('User not found');
            }
            const newAccessToken = JWTUtil.generateAccessToken(user._id, user.role.name);

            return {
                accessToken: newAccessToken
            };

        } catch (error) {
            Logger.error('Error in refresh token service:', error);
            throw new Error('Error refreshing token: ' + error.message);
        }
    }

    async logout (userId)
    {
        try {
            const user = await User.findById(userId);
            if (user) {
                user.lastLogout = new Date();
                await user.save();
            }

            return { message: 'Logged out successfully' };

        } catch (error) {
            Logger.error('Error in logout service:', error);
            throw new Error('Error logging out: ' + error.message);
        }
    }

}




export default AuthService;