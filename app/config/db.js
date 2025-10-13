import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) 
{
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
            await mongoose.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("Database connected");

        } catch (error) {
            console.error("Database connection failed", error.message);
            process.exit(1);
        }

    }
}

export const connectDB = () => new Database();
