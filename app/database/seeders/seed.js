// ============================================
// database/seeders/seed.js
// Run this to automatically create roles + admin
// ============================================

import bcrypt from 'bcryptjs';
import Role from '../../models/Role.js';
import User from '../../models/User.js';
import { connectDB } from '../../config/db.js';
import { ROLES } from '../../constants/roles.js';
import dotenv from 'dotenv';

dotenv.config();

// Default Roles Configuration
const defaultRoles = [
  {
    name: ROLES.ADMIN,
    description: 'System Administrator with full access',
    permissions: {
      users: {
        create: true,
        read: true,
        update: true,
        delete: true,
        suspend: true,
        manageRoles: true
      },
      patients: {
        create: true,
        read: 'all',
        update: true,
        delete: true
      },
      appointments: {
        create: true,
        read: 'all',
        update: true,
        delete: true
      },
      roles: {
        create: true,
        read: true,
        update: true,
        delete: true
      }
    },
    isActive: true
  },
  {
    name: ROLES.DOCTOR,
    description: 'Medical Doctor',
    permissions: {
      users: {
        create: false,
        read: false,
        update: false,
        delete: false,
        suspend: false,
        manageRoles: false
      },
      patients: {
        create: true,
        read: 'own', 
        update: true,
        delete: false
      },
      appointments: {
        create: true,
        read: 'own', 
        update: true,
        delete: true
      },
      roles: {
        create: false,
        read: false,
        update: false,
        delete: false
      }
    },
    isActive: true
  },
  {
    name: ROLES.NURSE,
    description: 'Nurse',
    permissions: {
      users: {
        create: false,
        read: false,
        update: false,
        delete: false,
        suspend: false,
        manageRoles: false
      },
      patients: {
        create: true,
        read: 'all',
        update: true,
        delete: false
      },
      appointments: {
        create: true,
        read: 'all',
        update: true,
        delete: false
      },
      roles: {
        create: false,
        read: false,
        update: false,
        delete: false
      }
    },
    isActive: true
  },
  {
    name: ROLES.RECEPTION,
    description: 'Reception/Secretary',
    permissions: {
      users: {
        create: false,
        read: true, // Can see users list
        update: false,
        delete: false,
        suspend: false,
        manageRoles: false
      },
      patients: {
        create: true,
        read: 'all',
        update: true,
        delete: false
      },
      appointments: {
        create: true,
        read: 'all',
        update: true,
        delete: true
      },
      roles: {
        create: false,
        read: false,
        update: false,
        delete: false
      }
    },
    isActive: true
  },
  {
    name: ROLES.PATIENT,
    description: 'Patient',
    permissions: {
      users: {
        create: false,
        read: false,
        update: false,
        delete: false,
        suspend: false,
        manageRoles: false
      },
      patients: {
        create: false,
        read: 'own', 
        update: 'own', 
        delete: false
      },
      appointments: {
        create: true, // Can book appointments
        read: 'own', // Only see own appointments
        update: 'own', // Can reschedule own appointments
        delete: 'own' // Can cancel own appointments
      },
      roles: {
        create: false,
        read: false,
        update: false,
        delete: false
      }
    },
    isActive: true
  }
];

// Seed Roles
const seedRoles = async () => {
  try {
    // Delete existing roles to ensure clean state
    await Role.deleteMany({});
    console.log('🗑️  Cleared existing roles');

    // Insert default roles
    const roles = await Role.insertMany(defaultRoles);
    console.log('✨ Default roles created successfully:');
    roles.forEach(role => {
      console.log(`   - ${role.name}`);
    });
    
    return roles;
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
};

// Seed Admin User
const seedAdmin = async (roles) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@healthpulse.health' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping admin seeding.');
      return existingAdmin;
    }

    // Find admin role
    const adminRole = roles.find(role => role.name === ROLES.ADMIN);
    
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const admin = await User.create({
      email: 'admin@healthpulse.health',
      password: hashedPassword,
      roleId: adminRole._id, // This matches the User model's field name
      fname: 'Zakaria',
      lname: 'Kardache',
      phone: '0612345678',
      isActive: true
    });

    console.log('✅ Admin user created successfully:');
    console.log('   📧 Email: admin@healthpulse.health');
    console.log('   👤 Name: Zakaria Kardache');
    console.log('   🔑 Password: password');
    console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
    
    return admin;
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  }
};

// Main Seed Function
const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    console.log('📡 Connecting to:', process.env.MONGODB_URI);
    
    await connectDB();
    console.log('✅ Database connected successfully\n');
    
    // Seed roles first
    const roles = await seedRoles();
    
    // Then seed admin
    await seedAdmin(roles);
    
    // Verify seeding
    const createdRoles = await Role.find();
    console.log('\n🔍 Verifying created roles:');
    createdRoles.forEach(role => {
      console.log(`   - ${role.name} (${role._id})`);
    });
    
    console.log('\n✅ Database seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
};


seed();