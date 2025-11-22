#!/usr/bin/env node

/**
 * Database Initialization Script
 * This script creates all collections with proper indexes
 * 
 * Usage: node scripts/initDb.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Logger from '../app/logs/Logger.js';

// Import all models
import User from '../app/models/User.js';
import Patient from '../app/models/Patient.js';
import Role from '../app/models/Role.js';
import Termin from '../app/models/Termin.js';
import Consultation from '../app/models/Consultation.js';
import Prescription from '../app/models/Prescription.js';
import Pharmacy from '../app/models/Pharmacy.js';
import Laboratory from '../app/models/Laboratory.js';
import RefreshToken from '../app/models/RefreshToken.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const models = {
    User,
    Patient,
    Role,
    Termin,
    Consultation,
    Prescription,
    Pharmacy,
    Laboratory,
    RefreshToken
};

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing Database...\n');
        console.log('='.repeat(60));
        
        // Connect to database
        await mongoose.connect(MONGODB_URI);
        console.log(`✅ Connected to: ${mongoose.connection.name}`);
        console.log(`📍 Host: ${mongoose.connection.host}:${mongoose.connection.port}\n`);
        
        // Create collections
        console.log('📦 Creating Collections with Indexes...\n');
        
        for (const [modelName, Model] of Object.entries(models)) {
            try {
                // Check if collection exists
                const collections = await mongoose.connection.db.listCollections({ name: Model.collection.name }).toArray();
                
                if (collections.length > 0) {
                    console.log(`ℹ️  Collection exists: ${modelName}`);
                    // Sync indexes (will add missing ones and remove extra ones)
                    await Model.syncIndexes();
                    console.log(`   🔄 Indexes synchronized`);
                } else {
                    // Create new collection
                    await Model.createCollection();
                    console.log(`✅ Created collection for: ${modelName}`);
                    // Create indexes
                    await Model.createIndexes();
                }
                
                // Get index info
                const indexes = await Model.collection.getIndexes();
                const indexCount = Object.keys(indexes).length;
                console.log(`   📑 Indexes: ${indexCount}`);
                
                Object.entries(indexes).forEach(([name, index]) => {
                    const keys = Object.keys(index.key || index).join(', ');
                    const unique = index.unique ? ' [UNIQUE]' : '';
                    console.log(`   • ${name}: {${keys}}${unique}`);
                });
                
                console.log('');
                
            } catch (error) {
                console.error(`❌ Error with ${modelName}:`, error.message);
                // Continue with other models
            }
        }
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        console.log('='.repeat(60));
        console.log(`\n📊 Database Status:`);
        console.log(`   Total Collections: ${collections.length}`);
        console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
        
        console.log('\n✅ Database initialization completed!\n');
        
        Logger.database('Database initialized successfully', {
            collections: collections.length,
            names: collections.map(c => c.name)
        });
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        Logger.error('Database initialization failed', error);
        process.exit(1);
    }
}

initializeDatabase();