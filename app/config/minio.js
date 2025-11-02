import * as Minio from 'minio';
import { config } from 'dotenv';

config();

class MinIOClient {
    constructor() {
        this.client = null;
        this.bucketName = process.env.MINIO_BUCKET || 'healthpulse';
        this.isConnected = false;
    }

    async connect() {
        try {
            this.client = new Minio.Client({
                endPoint: process.env.MINIO_ENDPOINT || 'localhost',
                port: parseInt(process.env.MINIO_PORT) || 9000,
                useSSL: process.env.MINIO_USE_SSL === 'true' || false,
                accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
                secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
            });

            // Test connection by checking if bucket exists
            const bucketExists = await this.client.bucketExists(this.bucketName);
            
            if (!bucketExists) {
                console.log(`Creating bucket: ${this.bucketName}`);
                await this.client.makeBucket(this.bucketName, 'us-east-1');
            }

            this.isConnected = true;
            console.log('MinIO client connected successfully');
            return this.client;
        } catch (error) {
            console.error('Failed to connect to MinIO:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async uploadFile(objectName, filePath, metaData = {}) {
        try {
            if (!this.isConnected) {
                throw new Error('MinIO client not connected');
            }

            const result = await this.client.fPutObject(
                this.bucketName,
                objectName,
                filePath,
                metaData
            );

            console.log(`File uploaded successfully: ${objectName}`);
            return result;
        } catch (error) {
            console.error('Error uploading file to MinIO:', error);
            throw error;
        }
    }

    async uploadBuffer(objectName, buffer, metaData = {}) {
        try {
            if (!this.isConnected) {
                throw new Error('MinIO client not connected');
            }

            const result = await this.client.putObject(
                this.bucketName,
                objectName,
                buffer,
                metaData
            );

            console.log(`Buffer uploaded successfully: ${objectName}`);
            return result;
        } catch (error) {
            console.error('Error uploading buffer to MinIO:', error);
            throw error;
        }
    }

    async downloadFile(objectName, filePath) {
        try {
            if (!this.isConnected) {
                throw new Error('MinIO client not connected');
            }

            await this.client.fGetObject(this.bucketName, objectName, filePath);
            console.log(`File downloaded successfully: ${objectName}`);
            return true;
        } catch (error) {
            console.error('Error downloading file from MinIO:', error);
            throw error;
        }
    }

    async getFileStream(objectName) {
        try {
            if (!this.isConnected) {
                throw new Error('MinIO client not connected');
            }

            return await this.client.getObject(this.bucketName, objectName);
        } catch (error) {
            console.error('Error getting file stream from MinIO:', error);
            throw error;
        }
    }

    async deleteFile(objectName) {
        try {
            if (!this.isConnected) {
                throw new Error('MinIO client not connected');
            }

            await this.client.removeObject(this.bucketName, objectName);
            console.log(`File deleted successfully: ${objectName}`);
            return true;
        } catch (error) {
            console.error('Error deleting file from MinIO:', error);
            throw error;
        }
    }

    async listFiles(prefix = '', recursive = false) {
        try {
            if (!this.isConnected) {
                throw new Error('MinIO client not connected');
            }

            const objects = [];
            const stream = this.client.listObjects(this.bucketName, prefix, recursive);

            return new Promise((resolve, reject) => {
                stream.on('data', (obj) => objects.push(obj));
                stream.on('error', reject);
                stream.on('end', () => resolve(objects));
            });
        } catch (error) {
            console.error('Error listing files from MinIO:', error);
            throw error;
        }
    }

    async getFileInfo(objectName) {
        try {
            if (!this.isConnected) {
                throw new Error('MinIO client not connected');
            }

            return await this.client.statObject(this.bucketName, objectName);
        } catch (error) {
            console.error('Error getting file info from MinIO:', error);
            throw error;
        }
    }

    async generatePresignedUrl(objectName, expires = 24 * 60 * 60) {
        try {
            if (!this.isConnected) {
                throw new Error('MinIO client not connected');
            }

            return await this.client.presignedGetObject(
                this.bucketName,
                objectName,
                expires
            );
        } catch (error) {
            console.error('Error generating presigned URL:', error);
            throw error;
        }
    }

    async disconnect() {
        this.client = null;
        this.isConnected = false;
        console.log('MinIO client disconnected');
    }
}

// Create and export singleton instance
const minioClient = new MinIOClient();

export { minioClient };
export default minioClient;