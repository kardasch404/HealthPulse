import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthpulse';

async function resetPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@healthpulse.health' },
      { $set: { password: hashedPassword } }
    );

    console.log('Password reset result:', result);
    console.log('Admin password has been reset to: password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPassword();
