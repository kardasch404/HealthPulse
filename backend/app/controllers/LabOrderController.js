import BaseController from '../abstractions/BaseController.js';
import LabOrderService from '../services/LabOrderService.js';
import DocumentService from '../services/DocumentService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import Logger from '../logs/Logger.js';

class LabOrderController extends BaseController {
    async createLabOrder(req, res) {
        try {
            const data = {
                ...req.body,
                doctorId: req.user.userId
            };

            const result = await LabOrderService.createLabOrder(data);

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
            Logger.error('Error in createLabOrder controller', error);
            return this.handleError(res, error);
        }
    }

    async addTest(req, res) {
        try {
            const { id } = req.params;

            const result = await LabOrderService.addTestToOrder(id, req.body);

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
            Logger.error('Error in addTest controller', error);
            return this.handleError(res, error);
        }
    }

    async getAllLabOrders(req, res) {
        try {
            const { 
                patientId, 
                doctorId, 
                laboratoryId, 
                status, 
                urgency, 
                startDate, 
                endDate, 
                page = 1, 
                limit = 10 
            } = req.query;

            const filters = {};
            if (patientId) filters.patientId = patientId;
            if (doctorId) filters.doctorId = doctorId;
            if (laboratoryId) filters.laboratoryId = laboratoryId;
            if (status) filters.status = status;
            if (urgency) filters.urgency = urgency;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const result = await LabOrderService.getAllLabOrders(
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
                message: 'Lab orders retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getAllLabOrders controller', error);
            return this.handleError(res, error);
        }
    }

    async getLabOrderById(req, res) {
        try {
            const { id } = req.params;

            const result = await LabOrderService.getLabOrderById(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: 'Lab order retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getLabOrderById controller', error);
            return this.handleError(res, error);
        }
    }

    async getLabOrderByOrderNumber(req, res) {
        try {
            const { orderNumber } = req.params;

            const result = await LabOrderService.getLabOrderByOrderNumber(orderNumber);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: 'Lab order retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getLabOrderByOrderNumber controller', error);
            return this.handleError(res, error);
        }
    }

    async getLabOrdersByPatient(req, res) {
        try {
            const { patientId } = req.params;
            const { status } = req.query;

            const filters = {};
            if (status) filters.status = status;

            const result = await LabOrderService.getLabOrdersByPatient(patientId, filters);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Lab orders retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getLabOrdersByPatient controller', error);
            return this.handleError(res, error);
        }
    }

    async updateLabOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;
            const userId = req.user.userId;

            const result = await LabOrderService.updateLabOrderStatus(id, status, userId, reason);

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
            Logger.error('Error in updateLabOrderStatus controller', error);
            return this.handleError(res, error);
        }
    }

    async updateTestStatus(req, res) {
        try {
            const { id, testId } = req.params;
            const { status, results, interpretation, criticalValues, resultNotes } = req.body;
            const userId = req.user.userId;

            const resultData = {
                results,
                interpretation,
                criticalValues,
                resultNotes
            };

            const result = await LabOrderService.updateTestStatus(id, testId, status, resultData, userId);

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
            Logger.error('Error in updateTestStatus controller', error);
            return this.handleError(res, error);
        }
    }

    async addTestResults(req, res) {
        try {
            const { id, testId } = req.params;
            const userId = req.user.userId;

            const result = await LabOrderService.addTestResults(id, testId, req.body, userId);

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
            Logger.error('Error in addTestResults controller', error);
            return this.handleError(res, error);
        }
    }

    async getLabResults(req, res) {
        try {
            const { id } = req.params;

            const result = await LabOrderService.getLabResults(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: result.message,
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getLabResults controller', error);
            return this.handleError(res, error);
        }
    }

    async cancelLabOrder(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const userId = req.user.userId;

            const result = await LabOrderService.cancelLabOrder(id, reason, userId);

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
            Logger.error('Error in cancelLabOrder controller', error);
            return this.handleError(res, error);
        }
    }

    async getStatistics(req, res) {
        try {
            const { doctorId, laboratoryId, startDate, endDate } = req.query;

            const filters = {};
            if (doctorId) filters.doctorId = doctorId;
            if (laboratoryId) filters.laboratoryId = laboratoryId;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const result = await LabOrderService.getLabOrderStatistics(filters);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Statistics retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getStatistics controller', error);
            return this.handleError(res, error);
        }
    }

    async uploadLabResultsJSON(req, res) {
        try {
            const { id } = req.params;
            const resultsData = req.body;
            const userId = req.user.userId;

            const labOrderResult = await LabOrderService.getLabOrderById(id);
            if (!labOrderResult.success) {
                return this.handleError(res, {
                    message: labOrderResult.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            const result = await LabOrderService.uploadLabResultsJSON(id, resultsData, userId);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Lab results uploaded successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in uploadLabResultsJSON controller', error);
            return this.handleError(res, error);
        }
    }

    async uploadLabReportPDF(req, res) {
        try {
            const { id } = req.params;

            if (!req.file) {
                return this.handleError(res, {
                    message: 'No file uploaded',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const result = await LabOrderService.uploadLabReportPDF(id, req.file, req.body, req.user.userId);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Lab report uploaded successfully',
                data: result.data
            }, HTTP_STATUS.CREATED);
        } catch (error) {
            Logger.error('Error in uploadLabReportPDF controller', error);
            return this.handleError(res, error);
        }
    }

    async validateLabOrder(req, res) {
        try {
            const { id } = req.params;
            const { validationNotes } = req.body;
            const userId = req.user.userId;

            const result = await LabOrderService.validateLabOrder(id, userId, validationNotes);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Lab order validated successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in validateLabOrder controller', error);
            return this.handleError(res, error);
        }
    }

    async getResultHistory(req, res) {
        try {
            const { userId, role } = req.user;
            
            if (role !== 'lab_technician') {
                return this.handleError(res, {
                    message: 'Access denied',
                    statusCode: HTTP_STATUS.FORBIDDEN
                });
            }

            const Laboratory = (await import('../models/Laboratory.js')).default;
            const laboratory = await Laboratory.findOne({
                'technicians.userId': userId
            });
            
            if (!laboratory) {
                return this.handleError(res, {
                    message: 'Lab technician not assigned to any laboratory',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await LabOrderService.getCompletedOrdersByLaboratory(laboratory._id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Result history retrieved successfully',
                data: result.data
            });
        } catch (error) {
            Logger.error('Error in getResultHistory controller', error);
            return this.handleError(res, error);
        }
    }

    async getMyLabOrders(req, res) {
        try {
            const { userId, role } = req.user;
            const { page, limit, status } = req.query;
            
            console.log('getMyLabOrders called with userId:', userId, 'role:', role);
            
            if (role !== 'lab_technician') {
                console.log('Access denied - role is not lab_technician');
                return this.handleError(res, {
                    message: 'Access denied',
                    statusCode: HTTP_STATUS.FORBIDDEN
                });
            }

            const Laboratory = (await import('../models/Laboratory.js')).default;
            console.log('Searching for laboratory with technician userId:', userId);
            
            const laboratory = await Laboratory.findOne({
                'technicians.userId': userId
            });
            
            console.log('Laboratory found:', !!laboratory);
            if (laboratory) {
                console.log('Laboratory name:', laboratory.name);
                console.log('Technicians in lab:', laboratory.technicians.map(t => ({ name: t.name, userId: t.userId.toString() })));
            } else {
                // Debug: check all laboratories
                const allLabs = await Laboratory.find({});
                console.log('All laboratories:');
                allLabs.forEach(lab => {
                    console.log(`- ${lab.name}: technicians:`, lab.technicians.map(t => ({ name: t.name, userId: t.userId.toString() })));
                });
            }
            
            if (!laboratory) {
                return this.handleError(res, {
                    message: 'Lab technician not assigned to any laboratory',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            let filters = { laboratoryId: laboratory._id };
            if (status) filters.status = status;

            const result = await LabOrderService.getAllLabOrders(
                filters,
                parseInt(page) || 1,
                parseInt(limit) || 10
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Lab orders retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in getMyLabOrders controller:', error);
            Logger.error('Error in getMyLabOrders controller', error);
            return this.handleError(res, error);
        }
    }

    async downloadLabReport(req, res) {
        try {
            const { id } = req.params;

            const result = await LabOrderService.getLabOrderById(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleError(res, {
                message: 'Lab report not available yet',
                statusCode: HTTP_STATUS.NOT_FOUND
            });
        } catch (error) {
            Logger.error('Error in downloadLabReport controller', error);
            return this.handleError(res, error);
        }
    }
}

export default LabOrderController;
