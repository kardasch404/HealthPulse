import BaseController from '../abstractions/BaseController.js';
import PrescriptionService from '../services/PrescriptionService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class PrescriptionController extends BaseController {
    /**
     * Create prescription
     * @route POST /api/v1/prescriptions
     * @access Doctor only
     */
    async createPrescription(req, res) {
        try {
            const data = {
                ...req.body,
                doctorId: req.user.userId,
                createdBy: req.user.userId
            };
            
            const result = await PrescriptionService.createPrescription(data);

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
            return this.handleError(res, error);
        }
    }

    /**
     * Add medication to prescription
     * @route POST /api/v1/prescriptions/:id/medications
     * @access Doctor only
     */
    async addMedication(req, res) {
        try {
            const { id } = req.params;
            
            const result = await PrescriptionService.addMedication(id, req.body);

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
            return this.handleError(res, error);
        }
    }

    /**
     * List all prescriptions with filters
     * @route GET /api/v1/prescriptions/all
     * @access Admin, Doctor
     */
    async getAllPrescriptions(req, res) {
        try {
            const { patientId, doctorId, pharmacyId, status, dateFrom, dateTo, page, limit } = req.query;
            
            const filters = {};
            if (patientId) filters.patientId = patientId;
            if (doctorId) filters.doctorId = doctorId;
            if (pharmacyId) filters.pharmacyId = pharmacyId;
            if (status) filters.status = status;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const result = await PrescriptionService.getAllPrescriptions(
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
                message: 'Prescriptions retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get prescription details
     * @route GET /api/v1/prescriptions/:id
     * @access Doctor, Patient (own), Pharmacist (assigned), Admin
     */
    async getPrescriptionById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await PrescriptionService.getPrescriptionById(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            // Check authorization
            const { userId, role } = req.user;
            const prescription = result.data;
            
            const canAccess = 
                role === 'admin' ||
                prescription.doctorId._id.toString() === userId ||
                prescription.patientId._id.toString() === userId ||
                (role === 'pharmacist' && prescription.pharmacyId && prescription.pharmacyId._id.toString() === userId);

            if (!canAccess) {
                return this.handleError(res, {
                    message: 'You do not have permission to view this prescription',
                    statusCode: HTTP_STATUS.FORBIDDEN
                });
            }

            return this.handleSuccess(res, {
                message: 'Prescription retrieved successfully',
                data: prescription
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Update prescription (draft only)
     * @route PUT /api/v1/prescriptions/:id
     * @access Doctor only
     */
    async updatePrescription(req, res) {
        try {
            const { id } = req.params;
            
            const result = await PrescriptionService.updatePrescription(id, req.body);

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
            return this.handleError(res, error);
        }
    }

    /**
     * Sign prescription
     * @route PATCH /api/v1/prescriptions/:id/sign
     * @access Doctor only
     */
    async signPrescription(req, res) {
        try {
            const { id } = req.params;
            const doctorId = req.user.userId;
            
            const result = await PrescriptionService.signPrescription(id, doctorId);

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
            return this.handleError(res, error);
        }
    }

    /**
     * Assign prescription to pharmacy
     * @route PATCH /api/v1/prescriptions/:id/assign-pharmacy
     * @access Doctor only
     */
    async assignToPharmacy(req, res) {
        try {
            const { id } = req.params;
            const { pharmacyId } = req.body;

            if (!pharmacyId) {
                return this.handleError(res, {
                    message: 'Pharmacy ID is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await PrescriptionService.assignToPharmacy(id, pharmacyId);

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
            return this.handleError(res, error);
        }
    }

    /**
     * Update prescription status
     * @route PATCH /api/v1/prescriptions/:id/status
     * @access Pharmacist (for assigned prescriptions)
     */
    async updatePrescriptionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return this.handleError(res, {
                    message: 'Status is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await PrescriptionService.updateStatus(id, status);

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
            return this.handleError(res, error);
        }
    }

    /**
     * Cancel prescription
     * @route PATCH /api/v1/prescriptions/:id/cancel
     * @access Doctor only
     */
    async cancelPrescription(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!reason) {
                return this.handleError(res, {
                    message: 'Cancellation reason is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await PrescriptionService.cancelPrescription(id, reason);

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
            return this.handleError(res, error);
        }
    }

    /**
     * Get pharmacy prescriptions (for pharmacist)
     * @route GET /api/v1/prescriptions/pharmacy/:pharmacyId
     * @access Pharmacist only
     */
    async getPharmacyPrescriptions(req, res) {
        try {
            const { pharmacyId } = req.params;
            const { status } = req.query;
            
            const result = await PrescriptionService.getPharmacyPrescriptions(pharmacyId, status);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Pharmacy prescriptions retrieved successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }
}

export default PrescriptionController;
