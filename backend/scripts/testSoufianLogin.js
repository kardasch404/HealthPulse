import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';
import bcrypt from 'bcrypt';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function testSoufianLogin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' }).populate('roleId');
        
        if (soufian) {
            console.log('=== TESTING LOGIN ===');
            console.log('User found:', soufian.email);
            console.log('IsActive:', soufian.isActive);
            
            // Test password verification
            const testPassword = 'password123';
            console.log('Testing password:', testPassword);
            
            const isValid = await bcrypt.compare(testPassword, soufian.password);
            console.log('Password valid:', isValid);
            
            // Test with verifyPassword method if it exists
            if (typeof soufian.verifyPassword === 'function') {
                const isValidMethod = await soufian.verifyPassword(testPassword);
                console.log('Password valid (method):', isValidMethod);
            } else {
                console.log('verifyPassword method not found');
            }
            
        } else {
            console.log('Soufian not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testSoufianLogin();