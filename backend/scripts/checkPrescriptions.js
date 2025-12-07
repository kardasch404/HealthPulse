#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Prescription from '../app/models/Prescription.js';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';
import Pharmacy from '../app/models/Pharmacy.js';

dotenv.config();

async function checkPrescriptions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');
        
        // Get all prescriptions
        const prescriptions = await Prescription.find({})
            .populate('patientId', 'fname lname email')
            .populate('doctorId', 'fname lname email')
            .populate('assignedPharmacyId', 'name')
            .sort({ createdAt: -1 });
        
        console.log(`📋 Total Prescriptions: ${prescriptions.length}\n`);
        
        if (prescriptions.length === 0) {
            console.log('⚠️  No prescriptions found in database');
            return;
        }
        
        prescriptions.forEach((prescription, index) => {
            console.log(`${index + 1}. Prescription: ${prescription.prescriptionNumber}`);
            console.log(`   Patient: ${prescription.patientId?.fname} ${prescription.patientId?.lname}`);
            console.log(`   Doctor: ${prescription.doctorId?.fname} ${prescription.doctorId?.lname}`);
            console.log(`   Status: ${prescription.status}`);
            console.log(`   Assigned Pharmacy: ${prescription.assignedPharmacyId?.name || 'Not assigned'}`);
            console.log(`   Created: ${prescription.createdAt}`);
            console.log(`   Medications: ${prescription.medications?.length || 0}`);
            console.log('');
        });
        
        // Check pharmacies
        const pharmacies = await Pharmacy.find({});
        console.log(`🏥 Total Pharmacies: ${pharmacies.length}\n`);
        
        pharmacies.forEach((pharmacy, index) => {
            console.log(`${index + 1}. Pharmacy: ${pharmacy.name}`);
            console.log(`   ID: ${pharmacy._id}`);
            console.log(`   Status: ${pharmacy.status}`);
            console.log('');
        });
        
        // Check pharmacist users
        const pharmacists = await User.find({})
            .populate('roleId', 'name')
            .then(users => users.filter(user => user.roleId?.name === 'pharmacist'));
        
        console.log(`👨‍⚕️ Total Pharmacists: ${pharmacists.length}\n`);
        
        pharmacists.forEach((pharmacist, index) => {
            console.log(`${index + 1}. Pharmacist: ${pharmacist.fname} ${pharmacist.lname}`);
            console.log(`   ID: ${pharmacist._id}`);
            console.log(`   Email: ${pharmacist.email}`);
            console.log('');
        });
        
        await mongoose.disconnect();
        console.log('✅ Database check completed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPrescriptions();