import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Laboratory from '../app/models/Laboratory.js';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function checkUserIdMatch() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find soufian
        const soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        console.log('Soufian user ID:', soufian._id.toString());
        
        // Find laboratory
        const laboratory = await Laboratory.findOne();
        console.log('Laboratory technicians:');
        
        laboratory.technicians.forEach((tech, index) => {
            console.log(`${index + 1}. ${tech.name}`);
            console.log(`   User ID: ${tech.userId.toString()}`);
            console.log(`   Matches soufian: ${tech.userId.toString() === soufian._id.toString()}`);
        });
        
        // Test the exact query the backend uses
        const labWithTech = await Laboratory.findOne({
            'technicians.userId': soufian._id
        });
        
        console.log('\nBackend query result:');
        console.log('Laboratory found:', !!labWithTech);
        
        if (labWithTech) {
            console.log('Laboratory name:', labWithTech.name);
        } else {
            console.log('❌ No laboratory found with this query');
            
            // Try alternative query
            const labWithTechString = await Laboratory.findOne({
                'technicians.userId': soufian._id.toString()
            });
            console.log('Alternative query (string):', !!labWithTechString);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkUserIdMatch();