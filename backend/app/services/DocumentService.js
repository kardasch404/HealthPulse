import MedicalDocument from '../models/MedicalDocument.js';
import minioClient from '../config/minio.js';
import Logger from '../logs/Logger.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class DocumentService {
    static async getAllDocuments(filters = {}, userId) {
        try {
            const query = { status: { $ne: 'deleted' } };
            
            if (filters.patientId) {
                query.patientId = filters.patientId;
            }
            if (filters.documentType) {
                query.documentType = filters.documentType;
            }
            if (filters.category) {
                query.category = filters.category;
            }
            if (filters.fromDate) {
                query.documentDate = { $gte: new Date(filters.fromDate) };
            }
            if (filters.toDate) {
                query.documentDate = { 
                    ...query.documentDate,
                    $lte: new Date(filters.toDate) 
                };
            }
            
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 20;
            const skip = (page - 1) * limit;
            
            const documents = await MedicalDocument.find(query)
                .populate('patientId', 'fname lname email')
                .populate('uploadedBy', 'fname lname role')
                .populate('consultationId', 'chiefComplaint')
                .populate('labOrderId', 'orderNumber')
                .populate('prescriptionId', 'orderNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            
            const total = await MedicalDocument.countDocuments(query);
            
            return {
                success: true,
                data: {
                    documents,
                    pagination: {
                        total,
                        page,
                        pages: Math.ceil(total / limit),
                        limit
                    }
                }
            };
        } catch (error) {
            Logger.error('Error getting all documents', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve documents'
            };
        }
    }

    static async uploadDocument(fileData, metadata, uploadedBy) {
        try {
            const { buffer, originalname, mimetype, size } = fileData;
            
            const fileExtension = path.extname(originalname);
            const fileName = `${uuidv4()}${fileExtension}`;
            const minioPath = `medical-documents/${metadata.patientId}/${fileName}`;
            
            await minioClient.uploadBuffer(minioPath, buffer, {
                'Content-Type': mimetype,
                'Original-Name': originalname
            });
            
            const document = new MedicalDocument({
                patientId: metadata.patientId,
                uploadedBy,
                documentType: metadata.documentType,
                title: metadata.title,
                description: metadata.description,
                fileName,
                originalFileName: originalname,
                fileSize: size,
                mimeType: mimetype,
                fileExtension,
                minioPath,
                documentDate: metadata.documentDate || new Date(),
                consultationId: metadata.consultationId,
                labOrderId: metadata.labOrderId,
                prescriptionId: metadata.prescriptionId,
                tags: metadata.tags || [],
                category: metadata.category,
                confidentialityLevel: metadata.confidentialityLevel || 'normal'
            });
            
            await document.save();
            
            Logger.info('Document uploaded successfully', { 
                documentId: document._id,
                patientId: metadata.patientId 
            });
            
            return {
                success: true,
                message: 'Document uploaded successfully',
                data: document
            };
        } catch (error) {
            Logger.error('Error uploading document', error);
            return {
                success: false,
                message: error.message || 'Failed to upload document'
            };
        }
    }
    
    static async getDocumentById(documentId, userId) {
        try {
            const document = await MedicalDocument.findById(documentId)
                .populate('patientId', 'fname lname email dateOfBirth')
                .populate('uploadedBy', 'fname lname email role')
                .populate('consultationId', 'chiefComplaint consultationDate')
                .populate('labOrderId', 'orderNumber status')
                .populate('prescriptionId', 'orderNumber status');
            
            if (!document || document.status === 'deleted') {
                return {
                    success: false,
                    message: 'Document not found'
                };
            }
            
            await document.recordView(userId, 'N/A');
            
            return {
                success: true,
                data: document
            };
        } catch (error) {
            Logger.error('Error getting document', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve document'
            };
        }
    }
    
    static async listPatientDocuments(patientId, filters = {}) {
        try {
            const query = { patientId, status: { $ne: 'deleted' } };
            
            if (filters.documentType) {
                query.documentType = filters.documentType;
            }
            if (filters.category) {
                query.category = filters.category;
            }
            if (filters.fromDate) {
                query.documentDate = { $gte: new Date(filters.fromDate) };
            }
            if (filters.toDate) {
                query.documentDate = { 
                    ...query.documentDate,
                    $lte: new Date(filters.toDate) 
                };
            }
            
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 20;
            const skip = (page - 1) * limit;
            
            const documents = await MedicalDocument.find(query)
                .populate('uploadedBy', 'fname lname role')
                .populate('consultationId', 'chiefComplaint')
                .populate('labOrderId', 'orderNumber')
                .populate('prescriptionId', 'orderNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            
            const total = await MedicalDocument.countDocuments(query);
            
            return {
                success: true,
                data: {
                    documents,
                    pagination: {
                        total,
                        page,
                        pages: Math.ceil(total / limit),
                        limit
                    }
                }
            };
        } catch (error) {
            Logger.error('Error listing documents', error);
            return {
                success: false,
                message: error.message || 'Failed to list documents'
            };
        }
    }
    
    static async downloadDocument(documentId, userId) {
        try {
            const document = await MedicalDocument.findById(documentId);
            
            if (!document || document.status === 'deleted') {
                return {
                    success: false,
                    message: 'Document not found'
                };
            }
            
            const fileStream = await minioClient.getFileStream(document.minioPath);
            
            await document.recordDownload(userId, 'N/A');
            
            return {
                success: true,
                data: {
                    stream: fileStream,
                    fileName: document.originalFileName,
                    mimeType: document.mimeType,
                    fileSize: document.fileSize
                }
            };
        } catch (error) {
            Logger.error('Error downloading document', error);
            return {
                success: false,
                message: error.message || 'Failed to download document'
            };
        }
    }
    
    static async updateDocument(documentId, updates, userId) {
        try {
            const document = await MedicalDocument.findById(documentId);
            
            if (!document || document.status === 'deleted') {
                return {
                    success: false,
                    message: 'Document not found'
                };
            }
            
            const allowedUpdates = [
                'title', 'description', 'documentType', 'category',
                'tags', 'confidentialityLevel', 'documentDate'
            ];
            
            allowedUpdates.forEach(field => {
                if (updates[field] !== undefined) {
                    document[field] = updates[field];
                }
            });
            
            await document.save();
            
            Logger.info('Document updated', { documentId, userId });
            
            return {
                success: true,
                message: 'Document updated successfully',
                data: document
            };
        } catch (error) {
            Logger.error('Error updating document', error);
            return {
                success: false,
                message: error.message || 'Failed to update document'
            };
        }
    }
    
    static async deleteDocument(documentId, userId, reason) {
        try {
            const document = await MedicalDocument.findById(documentId);
            
            if (!document || document.status === 'deleted') {
                return {
                    success: false,
                    message: 'Document not found'
                };
            }
            
            await document.softDelete(userId, reason);
            
            Logger.info('Document deleted', { documentId, userId, reason });
            
            return {
                success: true,
                message: 'Document deleted successfully'
            };
        } catch (error) {
            Logger.error('Error deleting document', error);
            return {
                success: false,
                message: error.message || 'Failed to delete document'
            };
        }
    }
    
    static async getConsultationDocuments(consultationId) {
        try {
            const documents = await MedicalDocument.findByConsultation(consultationId);
            
            return {
                success: true,
                data: documents
            };
        } catch (error) {
            Logger.error('Error getting consultation documents', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve documents'
            };
        }
    }
    
    static async getLabOrderDocuments(labOrderId) {
        try {
            const documents = await MedicalDocument.findByLabOrder(labOrderId);
            
            return {
                success: true,
                data: documents
            };
        } catch (error) {
            Logger.error('Error getting lab order documents', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve documents'
            };
        }
    }
}

export default DocumentService;
