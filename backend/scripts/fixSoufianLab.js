import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';

const MONGO_URI = 'mongodb://localhost:27018/healthpulse';

async function fixSoufianLab() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find soufian
        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        console.log('Soufian found:', !!soufian);
        console.log('Soufian ID:', soufian?._id);

        // Find or create laboratory
        let lab = await Laboratory.findOne({ name: 'Central Medical Laboratory' });
        
        if (!lab) {
            lab = new Laboratory({
                name: 'Central Medical Laboratory',
                address: '123 Medical Center St, Casablanca',
                phone: '0612345678',
                email: 'lab@healthpulse.health',
                licenseNumber: 'LAB-2024-001',
                accreditation: 'ISO15189',
                technicians: [{
                    userId: soufian._id,
                    name: `${soufian.fname} ${soufian.lname}`,
                    isActive: true
                }],
                status: 'active'
            });
            await lab.save();
            console.log('Created new laboratory');
        } else {
            // Add soufian to technicians if not already there
            const existingTech = lab.technicians.find(t => t.userId.toString() === soufian._id.toString());
            if (!existingTech) {
                lab.technicians.push({
                    userId: soufian._id,
                    name: `${soufian.fname} ${soufian.lname}`,
                    isActive: true
                });
                await lab.save();
                console.log('Added soufian to laboratory technicians');
            } else {
                console.log('Soufian already assigned to laboratory');
            }
        }

        console.log('Laboratory:', lab.name);
        console.log('Technicians:', lab.technicians);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixSoufianLab();