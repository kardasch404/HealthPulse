#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';
import Pharmacy from '../app/models/Pharmacy.js';

dotenv.config();

async function linkPharmacist() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');
        
        // Find the pharmacist user
        const pharmacist = await User.findOne({ email: 'zakiphar@healthpulse.health' })
            .populate('roleId', 'name');
        
        if (!pharmacist) {
            console.log('❌ Pharmacist user not found');
            return;
        }
        
        console.log(`👨⚕️ Found pharmacist: ${pharmacist.fname} ${pharmacist.lname}`);
        console.log(`   ID: ${pharmacist._id}`);
        console.log(`   Role: ${pharmacist.roleId?.name}\n`);
        
        // Find the pharmacy
        const pharmacy = await Pharmacy.findOne({ name: 'chifa_Pharmacy' });
        
        if (!pharmacy) {
            console.log('❌ Pharmacy not found');
            return;
        }
        
        console.log(`🏥 Found pharmacy: ${pharmacy.name}`);
        console.log(`   ID: ${pharmacy._id}\n`);
        
        // Check if pharmacist is already linked
        const isAlreadyLinked = pharmacy.pharmacists.some(p => p.userId?.toString() === pharmacist._id.toString());
        
        if (isAlreadyLinked) {
            console.log('✅ Pharmacist is already linked to this pharmacy');
        } else {
            // Link the pharmacist to the pharmacy
            pharmacy.pharmacists.push({
                userId: pharmacist._id,
                name: `${pharmacist.fname} ${pharmacist.lname}`,
                phone: pharmacist.phone,
                email: pharmacist.email,
                joinedDate: new Date()
            });
            
            await pharmacy.save();
            console.log('✅ Pharmacist successfully linked to pharmacy');
        }
        
        // Verify the link
        const updatedPharmacy = await Pharmacy.findById(pharmacy._id).populate('pharmacists.userId', 'fname lname email');
        console.log('\n📋 Pharmacy pharmacists:');
        updatedPharmacy.pharmacists.forEach((p, index) => {
            console.log(`   ${index + 1}. ${p.name} (${p.userId?.email})`);
        });
        
        await mongoose.disconnect();
        console.log('\n✅ Operation completed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

linkPharmacist();