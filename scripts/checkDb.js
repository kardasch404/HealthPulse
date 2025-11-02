#!/usr/bin/env node

/**
 * Database Status Checker
 * Run this script to check your database collections and indexes
 * 
 * Usage: node scripts/checkDb.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Logger from '../app/logs/Logger.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDatabase() {
    try {
        console.log('🔍 Checking Database Status...\n');
        console.log('=' .repeat(60));
        
        // Connect to database
        await mongoose.connect(MONGODB_URI);
        console.log(`✅ Connected to: ${mongoose.connection.name}`);
        console.log(`📍 Host: ${mongoose.connection.host}:${mongoose.connection.port}\n`);
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📚 Total Collections: ${collections.length}`);
        console.log('=' .repeat(60));
        
        if (collections.length === 0) {
            console.log('\n⚠️  No collections found in database');
            console.log('💡 Collections will be created when you insert the first document');
        } else {
            // Get stats for each collection
            for (const col of collections) {
                const collection = mongoose.connection.db.collection(col.name);
                const count = await collection.countDocuments();
                const indexes = await collection.indexes();
                
                console.log(`\n📋 Collection: ${col.name}`);
                console.log(`   Documents: ${count}`);
                console.log(`   Indexes: ${indexes.length}`);
                
                if (indexes.length > 0) {
                    indexes.forEach(idx => {
                        const keys = Object.keys(idx.key).join(', ');
                        const unique = idx.unique ? ' [UNIQUE]' : '';
                        console.log(`   • ${idx.name}: {${keys}}${unique}`);
                    });
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Database check completed!\n');
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        Logger.error('Database check failed', error);
        process.exit(1);
    }
}

checkDatabase();