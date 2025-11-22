import Redis from 'redis';
import { config } from 'dotenv';

config();

class RedisClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.client = Redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
                db: process.env.REDIS_DB || 0,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        console.error('Redis server connection refused');
                        return new Error('Redis server connection refused');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        console.error('Redis retry time exhausted');
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        console.error('Redis max attempts reached');
                        return undefined;
                    }
                    // Reconnect after
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            this.client.on('connect', () => {
                console.log('Redis client connected');
                this.isConnected = true;
            });

            this.client.on('error', (err) => {
                console.error('Redis client error:', err);
                this.isConnected = false;
            });

            this.client.on('end', () => {
                console.log('Redis client disconnected');
                this.isConnected = false;
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
        }
    }

    async set(key, value, expiration = null) {
        try {
            if (!this.isConnected) {
                throw new Error('Redis client not connected');
            }
            
            const serializedValue = JSON.stringify(value);
            if (expiration) {
                await this.client.setEx(key, expiration, serializedValue);
            } else {
                await this.client.set(key, serializedValue);
            }
            return true;
        } catch (error) {
            console.error('Redis SET error:', error);
            throw error;
        }
    }

    async get(key) {
        try {
            if (!this.isConnected) {
                throw new Error('Redis client not connected');
            }
            
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis GET error:', error);
            throw error;
        }
    }

    async del(key) {
        try {
            if (!this.isConnected) {
                throw new Error('Redis client not connected');
            }
            
            return await this.client.del(key);
        } catch (error) {
            console.error('Redis DEL error:', error);
            throw error;
        }
    }

    async exists(key) {
        try {
            if (!this.isConnected) {
                throw new Error('Redis client not connected');
            }
            
            return await this.client.exists(key);
        } catch (error) {
            console.error('Redis EXISTS error:', error);
            throw error;
        }
    }

    async flushAll() {
        try {
            if (!this.isConnected) {
                throw new Error('Redis client not connected');
            }
            
            return await this.client.flushAll();
        } catch (error) {
            console.error('Redis FLUSHALL error:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
const redisClient = new RedisClient();

export { redisClient };
export default redisClient;