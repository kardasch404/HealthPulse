import { config } from 'dotenv';
import mongoose from 'mongoose';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
before(async function() {
    this.timeout(10000);
    
    // Connect to test database if needed
    if (process.env.NODE_ENV === 'test' && process.env.MONGODB_TEST_URI) {
        await mongoose.connect(process.env.MONGODB_TEST_URI);
    }
});

// Global test teardown
after(async function() {
    this.timeout(5000);
    
    // Clean up test database connection
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
});

// Set test environment
process.env.NODE_ENV = 'test';