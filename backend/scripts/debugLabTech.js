import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';
import LabOrder from '../app/models/LabOrder.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function debugLabTech() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find soufian user
        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        console.log('\n=== SOUFIAN USER ===');
        if (soufian) {
            console.log('Found soufian:', soufian.fname, soufian.lname);
            console.log('Email:', soufian.email);
            console.log('Role:', soufian.role);
            console.log('RoleId:', soufian.roleId);
            console.log('User ID:', soufian._id);
        } else {
            console.log('Soufian user not found');
        }

        // Find laboratory
        const laboratory = await Laboratory.findOne();
        console.log('\n=== LABORATORY ===');
        if (laboratory) {
            console.log('Laboratory name:', laboratory.name);
            console.log('Laboratory ID:', laboratory._id);
            console.log('Technicians count:', laboratory.technicians?.length || 0);
            
            if (laboratory.technicians && laboratory.technicians.length > 0) {
                console.log('Technicians:');
                laboratory.technicians.forEach((tech, index) => {
                    console.log(`  ${index + 1}. ${tech.name} (ID: ${tech.userId})`);
                });
                
                // Check if soufian is linked
                if (soufian) {
                    const isLinked = laboratory.technicians.some(t => t.userId.toString() === soufian._id.toString());
                    console.log('Is soufian linked to lab?', isLinked);
                }
            }
        } else {
            console.log('No laboratory found');
        }

        // Find lab orders
        console.log('\n=== LAB ORDERS ===');
        const allOrders = await LabOrder.find({});
        console.log('Total lab orders:', allOrders.length);
        
        if (laboratory) {
            const labOrders = await LabOrder.find({ laboratoryId: laboratory._id });
            console.log('Orders for this laboratory:', labOrders.length);
            
            labOrders.forEach((order, index) => {
                console.log(`  ${index + 1}. ${order.orderNumber} - Status: ${order.status} - Urgency: ${order.urgency}`);
            });
        }

        // Test the backend logic
        if (soufian && laboratory) {
            console.log('\n=== TESTING BACKEND LOGIC ===');
            
            // Simulate what the backend controller does
            const techInLab = laboratory.technicians.find(t => t.userId.toString() === soufian._id.toString());
            
            if (techInLab) {
                console.log('✅ Lab technician found in laboratory');
                
                const ordersForLab = await LabOrder.find({ laboratoryId: laboratory._id })
                    .populate('patientId', 'fname lname')
                    .populate('doctorId', 'fname lname');
                
                console.log('Orders that should be returned:', ordersForLab.length);
                ordersForLab.forEach(order => {
                    console.log(`  - ${order.orderNumber}: Patient=${order.patientId?.fname || 'Unknown'} ${order.patientId?.lname || ''}, Doctor=${order.doctorId?.fname || 'Unknown'} ${order.doctorId?.lname || ''}`);
                });
            } else {
                console.log('❌ Lab technician NOT found in laboratory');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

debugLabTech();