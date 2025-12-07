import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';

const MONGO_URI = 'mongodb://localhost:27018/healthpulse';

async function fixAllUserRoles() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).populate('roleId');
        
        console.log(`Fixing ${users.length} users...`);
        
        for (const user of users) {
            if (user.roleId && user.roleId.name) {
                user.role = user.roleId.name;
                await user.save();
                console.log(`Fixed ${user.email}: ${user.role}`);
            }
        }

        console.log('All users fixed!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixAllUserRoles();