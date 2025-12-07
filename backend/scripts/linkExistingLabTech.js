import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';
import LabOrder from '../app/models/LabOrder.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function linkExistingLabTech() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the existing lab technician
        const labTech = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        
        if (!labTech) {
            console.log('Lab technician not found');
            return;
        }
        
        console.log('Found lab technician:', labTech.fname, labTech.lname);

        // Find or create a laboratory
        let laboratory = await Laboratory.findOne();
        
        if (!laboratory) {
            console.log('Creating laboratory...');
            laboratory = new Laboratory({
                name: 'Central Medical Laboratory',
                licenseNumber: 'LAB-2024-001',
                accreditation: 'CAP',
                phone: '0523456789',
                email: 'lab@healthpulse.com',
                address: '123 Medical Street, Casablanca',
                status: 'active',
                departments: [
                    { name: 'hematology', isActive: true },
                    { name: 'biochemistry', isActive: true },
                    { name: 'microbiology', isActive: true }
                ],
                availableTests: [
                    {
                        testCode: 'CBC',
                        testName: 'Complete Blood Count',
                        category: 'hematology',
                        specimen: 'blood',
                        turnaroundTime: 2,
                        price: 150,
                        isActive: true
                    },
                    {
                        testCode: 'GLU',
                        testName: 'Blood Glucose',
                        category: 'biochemistry',
                        specimen: 'blood',
                        turnaroundTime: 1,
                        price: 80,
                        isActive: true
                    }
                ]
            });
            
            await laboratory.save();
            console.log('Laboratory created:', laboratory.name);
        } else {
            console.log('Found existing laboratory:', laboratory.name);
        }

        // Link lab technician to laboratory
        const existingTech = laboratory.technicians.find(t => t.userId.toString() === labTech._id.toString());
        
        if (!existingTech) {
            console.log('Linking lab technician to laboratory...');
            laboratory.technicians.push({
                userId: labTech._id,
                name: `${labTech.fname} ${labTech.lname}`,
                licenseNumber: 'LT-2024-002',
                specialization: ['Clinical Chemistry', 'Hematology'],
                isActive: true
            });
            
            await laboratory.save();
            console.log('Lab technician linked to laboratory');
        } else {
            console.log('Lab technician already linked to laboratory');
        }

        // Create test lab orders if none exist
        const existingOrders = await LabOrder.countDocuments({ laboratoryId: laboratory._id });
        
        if (existingOrders === 0) {
            console.log('Creating test lab orders...');
            
            // Create mock IDs for doctor and patient
            const mockDoctorId = new mongoose.Types.ObjectId();
            const mockPatientId = new mongoose.Types.ObjectId();
            
            const testOrders = [
                {
                    patientId: mockPatientId,
                    doctorId: mockDoctorId,
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
                },
                {
                    patientId: mockPatientId,
                    doctorId: mockDoctorId,
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
                    patientId: mockPatientId,
                    doctorId: mockDoctorId,
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
        } else {
            console.log(`Found ${existingOrders} existing lab orders`);
        }

        console.log('\n=== Setup Complete ===');
        console.log('Lab Technician:', labTech.fname, labTech.lname);
        console.log('Email:', labTech.email);
        console.log('Laboratory:', laboratory.name);
        console.log('Lab orders available:', await LabOrder.countDocuments({ laboratoryId: laboratory._id }));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

linkExistingLabTech();