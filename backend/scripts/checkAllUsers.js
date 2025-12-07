import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';

const MONGO_URI = 'mongodb://localhost:27018/healthpulse';

async function checkAllUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).populate('roleId');
        
        console.log(`\n=== FOUND ${users.length} USERS ===\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Name: ${user.fname} ${user.lname}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   RoleId: ${user.roleId?.name || 'NOT POPULATED'}`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   Password exists: ${!!user.password}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkAllUsers();