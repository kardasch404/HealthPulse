import mongoose from 'mongoose';
import User from '../app/models/User.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function checkLabTechs() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const labTechs = await User.find({ role: 'lab_technician' });
        
        console.log('Found lab technicians:', labTechs.length);
        labTechs.forEach(tech => {
            console.log(`- ${tech.fname} ${tech.lname} (${tech.email})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkLabTechs();