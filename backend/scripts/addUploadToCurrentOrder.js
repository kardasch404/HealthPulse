import mongoose from 'mongoose';
import LabOrder from '../app/models/LabOrder.js';
import User from '../app/models/User.js';

async function addUploadToCurrentOrder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/healthpulse');
        console.log('Connected to MongoDB');

        // Find the specific order
        const orderId = '6935a9164f574ca6a40673d1';
        const labOrder = await LabOrder.findById(orderId);
        
        if (!labOrder) {
            console.log('Order not found');
            return;
        }
        
        console.log('Found order:', labOrder.orderNumber);

        // Find lab technician
        const labTech = await User.findOne({ role: 'lab_technician' });
        
        // Add test upload data
        if (!labOrder.uploadedResults) {
            labOrder.uploadedResults = [];
        }
        
        if (!labOrder.uploadedReports) {
            labOrder.uploadedReports = [];
        }
        
        // Add JSON result
        labOrder.uploadedResults.push({
            type: 'json',
            data: {
                tests: [
                    {
                        testId: labOrder.tests[0]?._id,
                        results: { 
                            value: '12.5', 
                            unit: 'mg/dL',
                            referenceRange: '8.5-10.5'
                        },
                        interpretation: 'Slightly elevated',
                        resultNotes: 'Recommend follow-up'
                    }
                ],
                overallResults: 'Test results uploaded successfully'
            },
            uploadedAt: new Date(),
            uploadedBy: labTech._id
        });

        // Add fake PDF report
        labOrder.uploadedReports.push({
            fileName: 'lab-report-sample.pdf',
            fileUrl: 'http://localhost:9000/medical-documents/sample-report.pdf',
            uploadedAt: new Date(),
            uploadedBy: labTech._id,
            fileSize: 245760, // 240KB
            mimeType: 'application/pdf'
        });

        await labOrder.save();
        console.log('✅ Added upload data to current order');
        console.log('uploadedResults count:', labOrder.uploadedResults.length);
        console.log('uploadedReports count:', labOrder.uploadedReports.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

addUploadToCurrentOrder();