import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';
import jwt from 'jsonwebtoken';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function checkJWTUser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find soufian and generate a token to see what's in it
        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        
        if (soufian) {
            console.log('Soufian user ID:', soufian._id);
            console.log('Soufian role:', soufian.role);
            
            // Generate token like the login would
            const token = soufian.generateAuthToken();
            console.log('Generated token:', token);
            
            // Decode token to see what's inside
            const decoded = jwt.decode(token);
            console.log('Decoded token:', decoded);
            
            // Check laboratory with the userId from token
            const laboratory = await Laboratory.findOne({
                'technicians.userId': decoded.userId
            });
            
            if (laboratory) {
                console.log('✅ Laboratory found for token userId');
                console.log('Laboratory name:', laboratory.name);
                
                const tech = laboratory.technicians.find(t => t.userId.toString() === decoded.userId.toString());
                console.log('Technician in lab:', tech ? tech.name : 'Not found');
            } else {
                console.log('❌ No laboratory found for token userId');
                
                // Check all laboratories
                const allLabs = await Laboratory.find({});
                console.log('All laboratories:');
                allLabs.forEach(lab => {
                    console.log(`- ${lab.name}: ${lab.technicians.length} technicians`);
                    lab.technicians.forEach(tech => {
                        console.log(`  - ${tech.name} (${tech.userId})`);
                    });
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkJWTUser();