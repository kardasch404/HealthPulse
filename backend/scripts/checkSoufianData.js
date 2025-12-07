import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function checkSoufianData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' }).populate('roleId');
        
        if (soufian) {
            console.log('=== SOUFIAN USER DATA ===');
            console.log('ID:', soufian._id);
            console.log('Email:', soufian.email);
            console.log('Password exists:', !!soufian.password);
            console.log('Role field:', soufian.role);
            console.log('RoleId field:', soufian.roleId);
            console.log('IsActive:', soufian.isActive);
            
            if (soufian.roleId) {
                console.log('RoleId populated name:', soufian.roleId.name);
            }
        } else {
            console.log('Soufian not found');
        }

        // Check all roles
        const roles = await Role.find({});
        console.log('\n=== ALL ROLES ===');
        roles.forEach(role => {
            console.log(`${role.name}: ${role._id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkSoufianData();