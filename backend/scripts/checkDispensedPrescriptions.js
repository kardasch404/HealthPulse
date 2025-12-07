import mongoose from 'mongoose';
import Prescription from '../app/models/Prescription.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function checkDispensedPrescriptions() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all dispensed prescriptions
        const dispensedPrescriptions = await Prescription.find({ status: 'dispensed' })
            .populate('patientId', 'fname lname')
            .populate('doctorId', 'fname lname')
            .lean();

        console.log('\n=== DISPENSED PRESCRIPTIONS ===');
        console.log(`Found ${dispensedPrescriptions.length} dispensed prescriptions:`);
        
        dispensedPrescriptions.forEach((prescription, index) => {
            console.log(`\n${index + 1}. Prescription: ${prescription.prescriptionNumber}`);
            console.log(`   Status: ${prescription.status}`);
            console.log(`   Patient: ${prescription.patientId?.fname} ${prescription.patientId?.lname}`);
            console.log(`   Doctor: ${prescription.doctorId?.fname} ${prescription.doctorId?.lname}`);
            console.log(`   Created: ${prescription.createdAt}`);
            console.log(`   Updated: ${prescription.updatedAt}`);
            console.log(`   Assigned Pharmacy: ${prescription.assignedPharmacyId}`);
            console.log(`   Dispensed By:`, prescription.dispensedBy);
        });

        // Check all prescriptions to see their statuses
        const allPrescriptions = await Prescription.find({}).select('prescriptionNumber status assignedPharmacyId dispensedBy').lean();
        console.log('\n=== ALL PRESCRIPTIONS STATUS ===');
        console.log(`Total prescriptions found: ${allPrescriptions.length}`);
        allPrescriptions.forEach(p => {
            console.log(`${p.prescriptionNumber}: ${p.status} (Pharmacy: ${p.assignedPharmacyId})`);
        });

        // Check if there are any prescriptions at all
        const totalCount = await Prescription.countDocuments();
        console.log(`\nTotal prescription count: ${totalCount}`);
        
        // Check specific prescription
        const specificPrescription = await Prescription.findOne({ prescriptionNumber: 'RX2025272085818' }).lean();
        if (specificPrescription) {
            console.log('\n=== SPECIFIC PRESCRIPTION RX2025272085818 ===');
            console.log(JSON.stringify(specificPrescription, null, 2));
        } else {
            console.log('\nPrescription RX2025272085818 not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkDispensedPrescriptions();