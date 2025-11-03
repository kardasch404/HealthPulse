import BaseController from '../abstractions/BaseController.js';
import LabOrderService from '../services/LabOrderService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import Logger from '../logs/Logger.js';

class LabOrderController extends BaseController {
    /**
     * Create lab order
     * @route POST /api/v1/lab-orders
     * @access Doctor only
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
     * Add test to existing lab order
     * @route PUT /api/v1/lab-orders/:id/tests
     * @access Doctor only
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
     * Get all lab orders with filters
     * @route GET /api/v1/lab-orders
     * @access Doctor, Admin, Lab Technician
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
     * Get lab order by ID
     * @route GET /api/v1/lab-orders/:id
     * @access Doctor, Patient, Lab Technician
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
     * Get lab order by order number
     * @route GET /api/v1/lab-orders/order-number/:orderNumber
     * @access Doctor, Patient, Lab Technician
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
     * Get lab orders by patient
     * @route GET /api/v1/lab-orders/patient/:patientId
     * @access Doctor, Patient
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
     * Update lab order status
     * @route PATCH /api/v1/lab-orders/:id/status
     * @access Lab Technician, Doctor
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
     * Update test status
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
     * Add test results
     * @route POST /api/v1/lab-orders/:id/tests/:testId/results
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
     * Get lab results
     * @route GET /api/v1/lab-orders/:id/results
     * @access Doctor, Patient, Lab Technician
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
     * Cancel lab order
     * @route POST /api/v1/lab-orders/:id/cancel
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
     * Get lab order statistics
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
}

export default LabOrderController;
