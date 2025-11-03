import BaseController from '../abstractions/BaseController.js';
import DocumentService from '../services/DocumentService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import Logger from '../logs/Logger.js';

class DocumentController extends BaseController {
    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                return this.handleError(res, {
                    message: 'No file uploaded',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const metadata = {
                patientId: req.body.patientId,
                documentType: req.body.documentType,
                title: req.body.title,
                description: req.body.description,
                documentDate: req.body.documentDate,
                consultationId: req.body.consultationId,
                labOrderId: req.body.labOrderId,
                prescriptionId: req.body.prescriptionId,
                tags: req.body.tags ? JSON.parse(req.body.tags) : [],
                category: req.body.category,
                confidentialityLevel: req.body.confidentialityLevel
            };
            
            const result = await DocumentService.uploadDocument(
                req.file,
                metadata,
                req.user.userId
            );
            
            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            return this.handleSuccess(res, {
                message: result.message,
                data: result.data
            }, HTTP_STATUS.CREATED);
        } catch (error) {
            Logger.error('Error in uploadDocument controller', error);
            return this.handleError(res, error);
        }
    }
    
    async listPatientDocuments(req, res) {
        try {
            const { patientId } = req.params;
            const filters = {
                documentType: req.query.documentType,
                category: req.query.category,
                fromDate: req.query.fromDate,
                toDate: req.query.toDate,
                page: req.query.page,
                limit: req.query.limit
            };
            
            const result = await DocumentService.listPatientDocuments(patientId, filters);
            
            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            return this.handleSuccess(res, {
                message: 'Documents retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in listPatientDocuments controller', error);
            return this.handleError(res, error);
        }
    }
    
    async getDocumentById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await DocumentService.getDocumentById(id, req.user.userId);
            
            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }
            
            return this.handleSuccess(res, {
                message: 'Document retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getDocumentById controller', error);
            return this.handleError(res, error);
        }
    }
    
    async downloadDocument(req, res) {
        try {
            const { id } = req.params;
            
            const result = await DocumentService.downloadDocument(id, req.user.userId);
            
            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }
            
            res.setHeader('Content-Type', result.data.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${result.data.fileName}"`);
            res.setHeader('Content-Length', result.data.fileSize);
            
            result.data.stream.pipe(res);
        } catch (error) {
            Logger.error('Error in downloadDocument controller', error);
            return this.handleError(res, error);
        }
    }
    
    async updateDocument(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            const result = await DocumentService.updateDocument(id, updates, req.user.userId);
            
            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            return this.handleSuccess(res, {
                message: result.message,
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in updateDocument controller', error);
            return this.handleError(res, error);
        }
    }
    
    async deleteDocument(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            
            const result = await DocumentService.deleteDocument(id, req.user.userId, reason);
            
            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            return this.handleSuccess(res, {
                message: result.message
            });
        } catch (error) {
            Logger.error('Error in deleteDocument controller', error);
            return this.handleError(res, error);
        }
    }
    
    async getConsultationDocuments(req, res) {
        try {
            const { consultationId } = req.params;
            
            const result = await DocumentService.getConsultationDocuments(consultationId);
            
            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            return this.handleSuccess(res, {
                message: 'Documents retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getConsultationDocuments controller', error);
            return this.handleError(res, error);
        }
    }
    
    async getLabOrderDocuments(req, res) {
        try {
            const { labOrderId } = req.params;
            
            const result = await DocumentService.getLabOrderDocuments(labOrderId);
            
            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            return this.handleSuccess(res, {
                message: 'Documents retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getLabOrderDocuments controller', error);
            return this.handleError(res, error);
        }
    }
}

export default DocumentController;
