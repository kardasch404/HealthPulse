#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';
import Pharmacy from '../app/models/Pharmacy.js';
import Prescription from '../app/models/Prescription.js';

dotenv.config();

async function checkPharmacistLink() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');
        
        // Check the specific pharmacist user
        const pharmacistUserId = '69359134058fd0b493c71a67';
        const pharmacist = await User.findById(pharmacistUserId).populate('roleId', 'name');
        
        if (!pharmacist) {
            console.log('❌ Pharmacist user not found');
            return;
        }
        
        console.log(`👨⚕️ Pharmacist: ${pharmacist.fname} ${pharmacist.lname}`);
        console.log(`   ID: ${pharmacist._id}`);
        console.log(`   Email: ${pharmacist.email}`);
        console.log(`   Role: ${pharmacist.roleId?.name}\n`);
        
        // Find pharmacy with this pharmacist
        const pharmacy = await Pharmacy.findOne({
            'pharmacists.userId': pharmacistUserId
        });
        
        if (pharmacy) {
            console.log(`🏥 Linked to pharmacy: ${pharmacy.name}`);
            console.log(`   Pharmacy ID: ${pharmacy._id}\n`);
            
            // Check prescriptions assigned to this pharmacy
            const prescriptions = await Prescription.find({
                assignedPharmacyId: pharmacy._id
            }).populate('patientId', 'fname lname').populate('doctorId', 'fname lname');
            
            console.log(`📋 Prescriptions assigned to ${pharmacy.name}: ${prescriptions.length}`);
            prescriptions.forEach((p, i) => {
                console.log(`   ${i+1}. ${p.prescriptionNumber} - ${p.patientId?.fname} ${p.patientId?.lname} - Status: ${p.status}`);
            });
        } else {
            console.log('❌ Pharmacist not linked to any pharmacy');
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Check completed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPharmacistLink();