import LaboratoryService from '../services/LaboratoryService.js';
import LaboratoryValidator from '../validators/LaboratoryValidator.js';
import BaseController from '../abstractions/BaseController.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import Logger from '../logs/Logger.js';

class LaboratoryController extends BaseController {
    
    async registerLaboratory(req, res) {
        try {
            const validation = LaboratoryValidator.validateRegister(req.body);
            if (!validation.valid) {
                return this.handleError(res, {
                    message: 'Validation failed',
                    errors: validation.errors,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const result = await LaboratoryService.registerLaboratory(validation.data);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: result.message,
                data: result.data,
                statusCode: HTTP_STATUS.CREATED
            });
        } catch (error) {
            Logger.error('Error in registerLaboratory', error);
            return this.handleError(res, {
                message: 'Failed to register laboratory',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * @route GET /api/v1/laboratories
     * @access Doctor, Lab Technician
     */
    async getAllLaboratories(req, res) {
        try {
            const { status, page = 1, limit = 10, search, accreditation } = req.query;
            
            const filters = {};
            if (status) filters.status = status;
            if (search) filters.search = search;
            if (accreditation) filters.accreditation = accreditation;

            const result = await LaboratoryService.getAllLaboratories(
                filters, 
                parseInt(page), 
                parseInt(limit)
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Laboratories retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getAllLaboratories', error);
            return this.handleError(res, {
                message: 'Failed to retrieve laboratories',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * @route GET /api/v1/laboratories/:id
     * @access Doctor, Lab Technician
     */
    async getLaboratoryById(req, res) {
        try {
            const { id } = req.params;

            const result = await LaboratoryService.getLaboratoryById(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: 'Laboratory retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getLaboratoryById', error);
            return this.handleError(res, {
                message: 'Failed to retrieve laboratory',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * @route PUT /api/v1/laboratories/:id
     * @access Admin
     */
    async updateLaboratory(req, res) {
        try {
            const { id } = req.params;

            const validation = LaboratoryValidator.validateUpdate(req.body);
            if (!validation.valid) {
                return this.handleError(res, {
                    message: 'Validation failed',
                    errors: validation.errors,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const result = await LaboratoryService.updateLaboratory(id, validation.data);

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
            Logger.error('Error in updateLaboratory', error);
            return this.handleError(res, {
                message: 'Failed to update laboratory',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    }

    async activateLaboratory(req, res) {
        try {
            const { id } = req.params;

            const result = await LaboratoryService.activateLaboratory(id);

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
            Logger.error('Error in activateLaboratory', error);
            return this.handleError(res, {
                message: 'Failed to activate laboratory',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    }

    async suspendLaboratory(req, res) {
        try {
            const { id } = req.params;
            const { reason, suspensionDuration, notifyStaff, allowEmergency } = req.body;

            const result = await LaboratoryService.suspendLaboratory(id, reason, {
                duration: suspensionDuration,
                notifyStaff,
                allowEmergency
            });

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
            Logger.error('Error in suspendLaboratory', error);
            return this.handleError(res, {
                message: 'Failed to suspend laboratory',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    }

    async deleteLaboratory(req, res) {
        try {
            const { id } = req.params;

            const result = await LaboratoryService.deleteLaboratory(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: result.message
            });
        } catch (error) {
            Logger.error('Error in deleteLaboratory', error);
            return this.handleError(res, {
                message: 'Failed to delete laboratory',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    }

    async searchLaboratories(req, res) {
        try {
            const { q } = req.query;

            if (!q) {
                return this.handleError(res, {
                    message: 'Search query is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const result = await LaboratoryService.searchLaboratories(q);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Search completed successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in searchLaboratories', error);
            return this.handleError(res, {
                message: 'Failed to search laboratories',
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    }
}

export default LaboratoryController;