/**
 * Fix Termin Collection Indexes
 * This script drops the problematic index and recreates it correctly
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthpulse';

async function fixTerminIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('termins');

        // Get all existing indexes
        console.log('\n📋 Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
            if (index.partialFilterExpression) {
                console.log(`    ⚠️  Has partial filter:`, JSON.stringify(index.partialFilterExpression));
            }
        });

        // Drop the problematic index if it exists
        const problematicIndexName = 'doctorId_1_date_1_startTime_1';
        
        try {
            console.log(`\n🗑️  Dropping index: ${problematicIndexName}`);
            await collection.dropIndex(problematicIndexName);
            console.log('✅ Index dropped successfully');
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
                console.log('ℹ️  Index not found (already removed)');
            } else {
                throw error;
            }
        }

        // Create the correct index (simple unique, no partial filter)
        console.log('\n📝 Creating new unique index...');
        await collection.createIndex(
            { 
                doctorId: 1, 
                date: 1, 
                startTime: 1 
            },
            { 
                unique: true,
                background: true,
                name: problematicIndexName
            }
        );
        console.log('✅ New index created successfully');

        // Verify the new indexes
        console.log('\n📋 Updated indexes:');
        const newIndexes = await collection.indexes();
        newIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
            if (index.unique) {
                console.log(`    ✓ Unique index`);
            }
            if (index.partialFilterExpression) {
                console.log(`    ⚠️  Has partial filter:`, JSON.stringify(index.partialFilterExpression));
            }
        });

        console.log('\n✅ Index fix completed successfully!');
        console.log('\nℹ️  Note: The unique constraint will apply to ALL appointments.');
        console.log('   Cancelled/no-show appointments should be handled in application logic.');
        console.log('   The TerminService already handles this by checking status during conflict detection.');

    } catch (error) {
        console.error('❌ Error fixing indexes:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the fix
fixTerminIndexes()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
