import mongoose from 'mongoose';
import Prescription from '../app/models/Prescription.js';
import User from '../app/models/User.js';
import Pharmacy from '../app/models/Pharmacy.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function createTestPrescriptions() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find existing users and pharmacy
        const doctor = await User.findOne({ role: 'doctor' });
        const patient = await User.findOne({ role: 'patient' });
        const pharmacy = await Pharmacy.findOne();

        if (!doctor || !patient || !pharmacy) {
            console.log('Missing required data:');
            console.log('Doctor found:', !!doctor);
            console.log('Patient found:', !!patient);
            console.log('Pharmacy found:', !!pharmacy);
            return;
        }

        console.log('Found doctor:', doctor.fname, doctor.lname);
        console.log('Found patient:', patient.fname, patient.lname);
        console.log('Found pharmacy:', pharmacy.name);

        // Create test prescriptions
        const testPrescriptions = [
            {
                prescriptionNumber: 'RX2025272085818',
                patientId: patient._id,
                doctorId: doctor._id,
                assignedPharmacyId: pharmacy._id,
                status: 'dispensed',
                medications: [
                    {
                        medicationName: 'Amoxicillin',
                        dosage: '500mg',
                        dosageForm: 'tablet',
                        frequency: 'twice daily',
                        duration: { value: 7, unit: 'days' },
                        quantity: 14,
                        instructions: 'Take with food'
                    }
                ],
                dispensedBy: {
                    pharmacyId: pharmacy._id,
                    pharmacistName: 'Test Pharmacist',
                    dispensedAt: new Date(),
                    notes: 'Dispensed successfully'
                }
            },
            {
                patientId: patient._id,
                doctorId: doctor._id,
                assignedPharmacyId: pharmacy._id,
                status: 'active',
                medications: [
                    {
                        medicationName: 'Ibuprofen',
                        dosage: '400mg',
                        dosageForm: 'tablet',
                        frequency: 'three times daily',
                        duration: { value: 5, unit: 'days' },
                        quantity: 15,
                        instructions: 'Take after meals'
                    }
                ]
            }
        ];

        for (const prescData of testPrescriptions) {
            const prescription = new Prescription(prescData);
            await prescription.save();
            console.log('Created prescription:', prescription.prescriptionNumber);
        }

        console.log('Test prescriptions created successfully!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createTestPrescriptions();