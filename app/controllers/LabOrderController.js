import BaseController from '../abstractions/BaseController.js';
import LabOrderService from '../services/LabOrderService.js';
import DocumentService from '../services/DocumentService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import Logger from '../logs/Logger.js';

class LabOrderController extends BaseController {
    /**
     * @route POST /api/v1/lab-orders
     * @access Doctor
     */
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

    /**
     * @route PUT /api/v1/lab-orders/:id/tests
     * @access Doctor, Lab Technician
     */
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

    /**
     * @route GET /api/v1/lab-orders
     * @access Doctor, Lab Technician, Nurse
     */
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

    /**
     * @route GET /api/v1/lab-orders/:id
     * @access Doctor, Lab Technician, Nurse
     */
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

    /**
     * @route GET /api/v1/lab-orders/order-number/:orderNumber
     * @access Doctor, Lab Technician, Nurse
     */
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

    /**
     * @route GET /api/v1/lab-orders/patient/:patientId
     * @access Doctor, Lab Technician, Nurse
     */
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

    /**
     * @route PATCH /api/v1/lab-orders/:id/status
     * @access Doctor, Lab Technician
     */
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

    /**
     * @route PATCH /api/v1/lab-orders/:id/tests/:testId/status
     * @access Lab Technician
     */
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

    /**
     * @route PUT /api/v1/lab-orders/:id/tests/:testId/results
     * @access Lab Technician
     */
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

    /**
     * @route GET /api/v1/lab-orders/:id/results
     * @access Doctor, Lab Technician, Nurse
     */
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

    /**
     * @route DELETE /api/v1/lab-orders/:id/cancel
     * @access Doctor
     */
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

    /**
     * @route GET /api/v1/lab-orders/statistics
     * @access Doctor, Lab Technician, Admin
     */
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

    /**
     * @route POST /api/v1/lab-orders/:id/upload-results
     * @access Lab Technician
     */
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

            const labOrder = labOrderResult.data;

            for (const testResult of resultsData.tests) {
                await LabOrderService.addTestResults(id, testResult.testId, {
                    results: testResult.results,
                    interpretation: testResult.interpretation,
                    criticalValues: testResult.criticalValues,
                    resultNotes: testResult.resultNotes
                }, userId);
            }

            return this.handleSuccess(res, {
                message: 'Lab results uploaded successfully',
                data: { labOrderId: id }
            });
        } catch (error) {
            Logger.error('Error in uploadLabResultsJSON controller', error);
            return this.handleError(res, error);
        }
    }

    /**
     * @route POST /api/v1/lab-orders/:id/upload-report
     * @access Lab Technician
     */
    async uploadLabReportPDF(req, res) {
        try {
            const { id } = req.params;

            if (!req.file) {
                return this.handleError(res, {
                    message: 'No file uploaded',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const labOrderResult = await LabOrderService.getLabOrderById(id);
            if (!labOrderResult.success) {
                return this.handleError(res, {
                    message: labOrderResult.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            const labOrder = labOrderResult.data;

            const documentMetadata = {
                patientId: labOrder.patientId._id || labOrder.patientId,
                documentType: 'lab_report',
                title: req.body.title || `Lab Report - ${labOrder.orderNumber}`,
                description: req.body.description || `Lab report for order ${labOrder.orderNumber}`,
                labOrderId: id,
                category: 'laboratory'
            };

            const uploadResult = await DocumentService.uploadDocument(
                req.file,
                documentMetadata,
                req.user.userId
            );

            if (!uploadResult.success) {
                return this.handleError(res, {
                    message: uploadResult.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Lab report uploaded successfully',
                data: uploadResult.data
            }, HTTP_STATUS.CREATED);
        } catch (error) {
            Logger.error('Error in uploadLabReportPDF controller', error);
            return this.handleError(res, error);
        }
    }

    /**
     * @route POST /api/v1/lab-orders/:id/validate
     * @access Lab Technician
     */
    async validateLabOrder(req, res) {
        try {
            const { id } = req.params;
            const { validationNotes } = req.body;
            const userId = req.user.userId;

            const result = await LabOrderService.updateLabOrderStatus(
                id,
                'completed',
                userId,
                `Validated by technician: ${validationNotes || 'No notes'}`
            );

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

    /**
     * @route GET /api/v1/lab-orders/:id/result-history
     * @access Doctor, Lab Technician, Nurse
     */
    async getResultHistory(req, res) {
        try {
            const { id } = req.params;

            const result = await LabOrderService.getLabOrderById(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            const labOrder = result.data;

            const history = {
                orderNumber: labOrder.orderNumber,
                statusHistory: labOrder.statusHistory || [],
                tests: labOrder.tests.map(test => ({
                    testName: test.testName,
                    testCode: test.testCode,
                    status: test.status,
                    results: test.results,
                    completedAt: test.completedAt,
                    technician: test.technician
                }))
            };

            return this.handleSuccess(res, {
                message: 'Result history retrieved successfully',
                data: history
            });
        } catch (error) {
            Logger.error('Error in getResultHistory controller', error);
            return this.handleError(res, error);
        }
    }
}

export default LabOrderController;
