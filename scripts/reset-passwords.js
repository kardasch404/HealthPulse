import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/healthpulse';

async function resetPasswords() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log('🔐 Generated hash for password123');

        const result = await mongoose.connection.db.collection('users').updateMany(
            {},
            { $set: { password: hashedPassword } }
        );

        console.log(`✅ Updated ${result.modifiedCount} users with new password: password123`);
        console.log('📧 All users can now login with password: password123');

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting passwords:', error);
        process.exit(1);
    }
}

resetPasswords();
