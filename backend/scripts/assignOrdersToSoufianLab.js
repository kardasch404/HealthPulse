import mongoose from 'mongoose';
import LabOrder from '../app/models/LabOrder.js';
import Laboratory from '../app/models/Laboratory.js';
import User from '../app/models/User.js';
import Patient from '../app/models/Patient.js';

const MONGO_URI = 'mongodb://localhost:27018/healthpulse';

async function assignOrdersToSoufianLab() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const advancedLab = await Laboratory.findOne({ name: 'Advanced Diagnostics Lab' });
        const unassignedOrders = await LabOrder.find({ laboratoryId: { $ne: advancedLab._id } });

        console.log(`Found ${unassignedOrders.length} orders not assigned to Advanced Diagnostics Lab`);
        
        for (const order of unassignedOrders) {
            order.laboratoryId = advancedLab._id;
            await order.save();
            console.log(`Assigned order ${order.orderNumber} to Advanced Diagnostics Lab`);
        }

        // Check final count
        const finalOrders = await LabOrder.find({ laboratoryId: advancedLab._id });
        console.log(`\nAdvanced Diagnostics Lab now has ${finalOrders.length} orders`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

assignOrdersToSoufianLab();