import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';
import LabOrder from '../app/models/LabOrder.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function createTestLabOrders() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const doctor = await User.findOne({ role: 'doctor' });
        const patient = await User.findOne({ role: 'patient' });
        const laboratory = await Laboratory.findOne();

        console.log('Doctor found:', !!doctor);
        console.log('Patient found:', !!patient);
        console.log('Laboratory found:', !!laboratory);

        if (!doctor || !patient || !laboratory) {
            console.log('Missing required data. Creating mock data...');
            
            // Create mock consultation ID
            const mockConsultationId = new mongoose.Types.ObjectId();
            
            // Use existing user IDs or create mock ones
            const doctorId = doctor?._id || new mongoose.Types.ObjectId();
            const patientId = patient?._id || new mongoose.Types.ObjectId();
            
            const testOrders = [
                {
                    patientId: patientId,
                    doctorId: doctorId,
                    laboratoryId: laboratory._id,
                    consultationId: mockConsultationId,
                    clinicalIndication: 'Routine health checkup',
                    urgency: 'routine',
                    status: 'pending',
                    tests: [
                        {
                            name: 'Complete Blood Count',
                            code: 'CBC',
                            category: 'Hematology',
                            urgency: 'routine',
                            status: 'pending',
                            expectedTurnaround: 2
                        }
                    ]
                },
                {
                    patientId: patientId,
                    doctorId: doctorId,
                    laboratoryId: laboratory._id,
                    consultationId: new mongoose.Types.ObjectId(),
                    clinicalIndication: 'Diabetes monitoring',
                    urgency: 'urgent',
                    status: 'sample_collected',
                    tests: [
                        {
                            name: 'Blood Glucose',
                            code: 'GLU',
                            category: 'Chemistry',
                            urgency: 'urgent',
                            status: 'in_progress',
                            expectedTurnaround: 1
                        }
                    ]
                },
                {
                    patientId: patientId,
                    doctorId: doctorId,
                    laboratoryId: laboratory._id,
                    consultationId: new mongoose.Types.ObjectId(),
                    clinicalIndication: 'Liver function assessment',
                    urgency: 'routine',
                    status: 'in_progress',
                    tests: [
                        {
                            name: 'Liver Function Tests',
                            code: 'LFT',
                            category: 'Chemistry',
                            urgency: 'routine',
                            status: 'in_progress',
                            expectedTurnaround: 4
                        }
                    ]
                }
            ];

            for (const orderData of testOrders) {
                const labOrder = new LabOrder(orderData);
                await labOrder.save();
                console.log('Created lab order:', labOrder.orderNumber);
            }
            
            console.log(`Created ${testOrders.length} test lab orders`);
        } else {
            console.log('All required data found, creating proper lab orders...');
            
            const testOrders = [
                {
                    patientId: patient._id,
                    doctorId: doctor._id,
                    laboratoryId: laboratory._id,
                    consultationId: new mongoose.Types.ObjectId(),
                    clinicalIndication: 'Routine health checkup',
                    urgency: 'routine',
                    status: 'pending',
                    tests: [
                        {
                            name: 'Complete Blood Count',
                            code: 'CBC',
                            category: 'Hematology',
                            urgency: 'routine',
                            status: 'pending',
                            expectedTurnaround: 2
                        }
                    ]
                }
            ];

            for (const orderData of testOrders) {
                const labOrder = new LabOrder(orderData);
                await labOrder.save();
                console.log('Created lab order:', labOrder.orderNumber);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createTestLabOrders();