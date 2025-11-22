import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Logger from '../logs/Logger.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env file");
}

class Database {
    static instance = null;

    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this._connect();
        Database.instance = this;
    }

    async _connect() {
        try {
            mongoose.set('strictQuery', true);
            
            Logger.info('Connecting to MongoDB', MONGODB_URI.replace(/\/\/.*@/, '//*****@'));
            
            await mongoose.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            
            Logger.database('Database connected successfully', {
                host: mongoose.connection.host,
                name: mongoose.connection.name,
                port: mongoose.connection.port
            });

            // Setup database event listeners
            this._setupEventListeners();

        } catch (error) {
            Logger.error('Database connection failed', error);
            process.exit(1);
        }
    }

    _setupEventListeners() {
        mongoose.connection.on('error', (err) => {
            Logger.error('MongoDB connection error', err);
        });

        mongoose.connection.on('disconnected', () => {
            Logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            Logger.info('MongoDB reconnected');
        });
    }

    async listCollections() {
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionNames = collections.map(col => col.name);
            Logger.database('Collections in database', collectionNames);
            return collectionNames;
        } catch (error) {
            Logger.error('Failed to list collections', error);
            return [];
        }
    }

    async getCollectionStats() {
        try {
            const collections = await this.listCollections();
            const stats = {};

            for (const collectionName of collections) {
                const collection = mongoose.connection.db.collection(collectionName);
                const count = await collection.countDocuments();
                const indexes = await collection.indexes();
                
                stats[collectionName] = {
                    documents: count,
                    indexes: indexes.length,
                    indexNames: indexes.map(idx => idx.name)
                };
            }

            Logger.database('Collection statistics', stats);
            return stats;
        } catch (error) {
            Logger.error('Failed to get collection stats', error);
            return {};
        }
    }
}

export const connectDB = () => new Database();

export default Database;
