import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';

const MONGO_URI = 'mongodb://localhost:27018/healthpulse';

async function checkLabs() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const labs = await Laboratory.find({});
        console.log(`Found ${labs.length} laboratories:`);
        
        labs.forEach((lab, index) => {
            console.log(`\n${index + 1}. ${lab.name}`);
            console.log(`   License: ${lab.licenseNumber}`);
            console.log(`   Status: ${lab.status}`);
            console.log(`   Technicians: ${lab.technicians.length}`);
            lab.technicians.forEach((tech, i) => {
                console.log(`     ${i + 1}. ${tech.name} (${tech.userId})`);
            });
        });

        // Find soufian
        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        console.log(`\nSoufian ID: ${soufian._id}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkLabs();