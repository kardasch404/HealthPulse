/**
 * Migration Script: Update Role Permissions
 * Adds MANAGE_MEDICAL_DOCUMENTS and VIEW_MEDICAL_DOCUMENTS to existing roles
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../app/models/Role.js';
import { ROLES, ROLE_PERMISSIONS } from '../app/constants/roles.js';

dotenv.config();

const updateRolePermissions = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/healthpulse');
        console.log('✅ Connected to MongoDB');

        console.log('\n🔄 Updating role permissions...\n');

        // Update each role with new permissions
        for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
            const role = await Role.findOne({ name: roleName });
            
            if (role) {
                // Update permissions array
                role.permissions = permissions;
                await role.save();
                
                console.log(`✅ Updated ${roleName} role with ${permissions.length} permissions`);
                console.log(`   New permissions: ${permissions.slice(-2).join(', ')}`);
            } else {
                // Create role if it doesn't exist
                const newRole = new Role({
                    name: roleName,
                    permissions: permissions,
                    description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`
                });
                await newRole.save();
                console.log(`✅ Created ${roleName} role with ${permissions.length} permissions`);
            }
        }

        console.log('\n✅ All roles updated successfully!');
        
        // Display summary
        console.log('\n📊 Permissions Summary:');
        const roles = await Role.find({});
        for (const role of roles) {
            console.log(`   ${role.name}: ${role.permissions.length} permissions`);
        }

        console.log('\n✨ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Error updating role permissions:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
        process.exit(0);
    }
};

// Run the migration
updateRolePermissions();
