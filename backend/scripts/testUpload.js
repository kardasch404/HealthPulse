import mongoose from 'mongoose';
import LabOrder from '../app/models/LabOrder.js';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';

async function testUploadFields() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/healthpulse');
        console.log('Connected to MongoDB');

        // Find a lab technician
        const labTech = await User.findOne({ role: 'lab_technician' });
        if (!labTech) {
            console.log('No lab technician found');
            return;
        }
        console.log('Lab technician found:', labTech.fname, labTech.lname);

        // Find their laboratory
        const laboratory = await Laboratory.findOne({
            'technicians.userId': labTech._id
        });
        if (!laboratory) {
            console.log('No laboratory found for technician');
            return;
        }
        console.log('Laboratory found:', laboratory.name);

        // Find a lab order for this laboratory
        const labOrder = await LabOrder.findOne({
            laboratoryId: laboratory._id
        }).populate('patientId', 'fname lname')
          .populate('doctorId', 'fname lname');

        if (!labOrder) {
            console.log('No lab orders found for this laboratory');
            return;
        }

        console.log('Lab order found:', labOrder.orderNumber);
        console.log('Patient:', labOrder.patientId?.fname, labOrder.patientId?.lname);
        console.log('Current uploadedReports:', labOrder.uploadedReports?.length || 0);
        console.log('Current uploadedResults:', labOrder.uploadedResults?.length || 0);

        // Test adding uploaded results
        if (!labOrder.uploadedResults) {
            labOrder.uploadedResults = [];
        }
        
        labOrder.uploadedResults.push({
            type: 'json',
            data: {
                tests: [
                    {
                        testId: labOrder.tests[0]?._id,
                        results: { value: '10.5', unit: 'mg/dL' },
                        interpretation: 'Normal'
                    }
                ],
                overallResults: 'Test upload successful'
            },
            uploadedAt: new Date(),
            uploadedBy: labTech._id
        });

        await labOrder.save();
        console.log('✅ Successfully added test upload data');
        console.log('Updated uploadedResults count:', labOrder.uploadedResults.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testUploadFields();