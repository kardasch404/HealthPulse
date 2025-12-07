import mongoose from 'mongoose';
import User from '../app/models/User.js';
import Role from '../app/models/Role.js';
import Laboratory from '../app/models/Laboratory.js';
import bcrypt from 'bcrypt';

const MONGO_URI = 'mongodb://localhost:27017/healthpulse';

async function fixUsersAndCreateSoufian() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Create roles if they don't exist
        const roles = [
            { name: 'admin', description: 'Administrator' },
            { name: 'lab_technician', description: 'Laboratory Technician' }
        ];

        for (const roleData of roles) {
            let role = await Role.findOne({ name: roleData.name });
            if (!role) {
                role = new Role(roleData);
                await role.save();
                console.log(`Created role: ${roleData.name}`);
            }
        }

        // Fix existing users
        const adminUser = await User.findOne({ email: 'admin@healthpulse.health' });
        if (adminUser && !adminUser.role) {
            const adminRole = await Role.findOne({ name: 'admin' });
            adminUser.role = 'admin';
            adminUser.roleId = adminRole._id;
            await adminUser.save();
            console.log('Fixed admin user role');
        }

        const labTechUser = await User.findOne({ email: 'lab.tech@healthpulse.com' });
        if (labTechUser && !labTechUser.role) {
            const labTechRole = await Role.findOne({ name: 'lab_technician' });
            labTechUser.role = 'lab_technician';
            labTechUser.roleId = labTechRole._id;
            await labTechUser.save();
            console.log('Fixed lab technician user role');
        }

        // Create soufian user
        let soufian = await User.findOne({ email: 'soufianlabo@healthpulse.health' });
        
        if (!soufian) {
            console.log('Creating soufian labo user...');
            const labTechRole = await Role.findOne({ name: 'lab_technician' });
            const hashedPassword = await bcrypt.hash('password123', 10);
            
            soufian = new User({
                fname: 'soufian',
                lname: 'labo',
                email: 'soufianlabo@healthpulse.health',
                password: hashedPassword,
                role: 'lab_technician',
                roleId: labTechRole._id,
                phone: '0612345680',
                isActive: true
            });
            
            await soufian.save();
            console.log('Soufian labo user created');
        } else {
            console.log('Soufian user already exists');
            // Fix role if missing
            if (!soufian.role) {
                const labTechRole = await Role.findOne({ name: 'lab_technician' });
                soufian.role = 'lab_technician';
                soufian.roleId = labTechRole._id;
                await soufian.save();
                console.log('Fixed soufian user role');
            }
        }

        // Create/find laboratory and link soufian
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
                ]
            });
            
            await laboratory.save();
            console.log('Laboratory created');
        }

        // Link soufian to laboratory
        const existingTech = laboratory.technicians.find(t => t.userId.toString() === soufian._id.toString());
        
        if (!existingTech) {
            console.log('Linking soufian to laboratory...');
            laboratory.technicians.push({
                userId: soufian._id,
                name: `${soufian.fname} ${soufian.lname}`,
                licenseNumber: 'LT-2024-003',
                specialization: ['Clinical Chemistry', 'Hematology'],
                isActive: true
            });
            
            await laboratory.save();
            console.log('Soufian linked to laboratory');
        }

        console.log('\n=== Setup Complete ===');
        console.log('Soufian Login:');
        console.log('Email: soufianlabo@healthpulse.health');
        console.log('Password: password123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixUsersAndCreateSoufian();