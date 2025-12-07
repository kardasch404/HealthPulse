import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';
import Laboratory from '../app/models/Laboratory.js';
import LabOrder from '../app/models/LabOrder.js';
import bcrypt from 'bcrypt';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function setupLabTechnician() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find or create lab technician role
        let labTechRole = await Role.findOne({ name: 'lab_technician' });
        
        if (!labTechRole) {
            console.log('Creating lab technician role...');
            labTechRole = new Role({
                name: 'lab_technician',
                description: 'Laboratory Technician',
                permissions: {
                    lab_orders: ['view', 'process', 'update'],
                    medical_documents: ['view', 'create', 'update']
                },
                isActive: true
            });
            
            await labTechRole.save();
            console.log('Lab technician role created');
        } else {
            console.log('Found existing lab technician role');
        }

        // Find or create a lab technician user
        let labTech = await User.findOne({ role: 'lab_technician' });
        
        if (!labTech) {
            console.log('Creating lab technician user...');
            const hashedPassword = await bcrypt.hash('password123', 10);
            
            labTech = new User({
                fname: 'Lab',
                lname: 'Technician',
                email: 'lab.tech@healthpulse.com',
                password: hashedPassword,
                role: 'lab_technician',
                roleId: labTechRole._id,
                phone: '0612345679',
                isActive: true
            });
            
            await labTech.save();
            console.log('Lab technician created:', labTech.email);
        } else {
            console.log('Found existing lab technician:', labTech.email);
        }

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
                licenseNumber: 'LT-2024-001',
                specialization: ['Clinical Chemistry', 'Hematology'],
                isActive: true
            });
            
            await laboratory.save();
            console.log('Lab technician linked to laboratory');
        } else {
            console.log('Lab technician already linked to laboratory');
        }

        // Create some test lab orders
        const doctor = await User.findOne({ role: 'doctor' });
        const patient = await User.findOne({ role: 'patient' });

        if (doctor && patient) {
            const existingOrders = await LabOrder.countDocuments({ laboratoryId: laboratory._id });
            
            if (existingOrders === 0) {
                console.log('Creating test lab orders...');
                
                const testOrders = [
                    {
                        patientId: patient._id,
                        doctorId: doctor._id,
                        laboratoryId: laboratory._id,
                        consultationId: new mongoose.Types.ObjectId(), // Mock consultation ID
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
                        patientId: patient._id,
                        doctorId: doctor._id,
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
        } else {
            console.log('Missing doctor or patient for creating test orders');
        }

        console.log('\n=== Setup Complete ===');
        console.log('Lab Technician Login:');
        console.log('Email:', labTech.email);
        console.log('Password: password123');
        console.log('Laboratory:', laboratory.name);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

setupLabTechnician();