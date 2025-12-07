import mongoose from 'mongoose';
import User from '../app/models/User.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function fixSoufianRole() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Fix soufian's role
        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        
        if (soufian) {
            console.log('Found soufian, current role:', soufian.role);
            
            soufian.role = 'lab_technician';
            await soufian.save();
            
            console.log('Updated soufian role to:', soufian.role);
            
            // Verify the fix
            const updatedSoufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
            console.log('Verified role:', updatedSoufian.role);
        } else {
            console.log('Soufian not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixSoufianRole();