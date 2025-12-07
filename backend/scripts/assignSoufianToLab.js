import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';

const MONGO_URI = 'mongodb://localhost:27018/healthpulse';

async function assignSoufianToLab() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        const lab = await Laboratory.findOne({ name: 'Advanced Diagnostics Lab' });

        if (soufian && lab) {
            lab.technicians.push({
                userId: soufian._id,
                name: `${soufian.fname} ${soufian.lname}`,
                isActive: true
            });
            
            await lab.save();
            console.log('Assigned soufian to Advanced Diagnostics Lab');
            console.log('Lab technicians:', lab.technicians.length);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

assignSoufianToLab();