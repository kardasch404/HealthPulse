import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';

async function assignLabTechToLab() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/healthpulse');
        console.log('Connected to MongoDB');

        // Find lab technician
        const labTech = await User.findOne({ role: 'lab_technician' });
        if (!labTech) {
            console.log('No lab technician found');
            return;
        }
        console.log('Lab technician found:', labTech.fname, labTech.lname, labTech._id);

        // Find or create a laboratory
        let laboratory = await Laboratory.findOne();
        if (!laboratory) {
            laboratory = new Laboratory({
                name: 'Central Laboratory',
                address: '123 Medical Center Dr',
                phone: '+1-555-0123',
                email: 'lab@healthpulse.com',
                workingHours: {
                    monday: { open: '08:00', close: '18:00' },
                    tuesday: { open: '08:00', close: '18:00' },
                    wednesday: { open: '08:00', close: '18:00' },
                    thursday: { open: '08:00', close: '18:00' },
                    friday: { open: '08:00', close: '18:00' },
                    saturday: { open: '09:00', close: '14:00' },
                    sunday: { open: false, close: false }
                },
                accreditation: ['CAP', 'CLIA'],
                status: 'active',
                technicians: []
            });
            await laboratory.save();
            console.log('Created new laboratory:', laboratory.name);
        } else {
            console.log('Found existing laboratory:', laboratory.name);
        }

        // Check if technician is already assigned
        const isAssigned = laboratory.technicians.some(tech => 
            tech.userId.toString() === labTech._id.toString()
        );

        if (!isAssigned) {
            laboratory.technicians.push({
                userId: labTech._id,
                name: `${labTech.fname} ${labTech.lname}`,
                specialization: ['Clinical Chemistry'],
                assignedAt: new Date()
            });
            await laboratory.save();
            console.log('✅ Assigned lab technician to laboratory');
        } else {
            console.log('Lab technician already assigned to laboratory');
        }

        console.log('Laboratory technicians:', laboratory.technicians.map(t => t.name));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

assignLabTechToLab();