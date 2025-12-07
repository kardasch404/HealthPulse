import mongoose from 'mongoose';
import LabOrder from '../app/models/LabOrder.js';
import Laboratory from '../app/models/Laboratory.js';
import User from '../app/models/User.js';
import Patient from '../app/models/Patient.js';

const MONGO_URI = 'mongodb://localhost:27018/healthpulse';

async function checkLabOrders() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const labOrders = await LabOrder.find({}).populate('patientId doctorId laboratoryId');
        console.log(`Found ${labOrders.length} lab orders:`);
        
        labOrders.forEach((order, index) => {
            console.log(`\n${index + 1}. Order #${order.orderNumber}`);
            console.log(`   Patient: ${order.patientId?.fname} ${order.patientId?.lname}`);
            console.log(`   Doctor: ${order.doctorId?.fname} ${order.doctorId?.lname}`);
            console.log(`   Laboratory: ${order.laboratoryId?.name || 'NOT ASSIGNED'}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Tests: ${order.tests?.length || 0}`);
        });

        // Check laboratories
        const labs = await Laboratory.find({});
        console.log(`\n=== LABORATORIES ===`);
        labs.forEach(lab => {
            console.log(`${lab.name} (ID: ${lab._id})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkLabOrders();