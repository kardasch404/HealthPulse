import BaseController from '../abstractions/BaseController.js';
import ConsultationService from '../services/ConsultationService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class ConsultationController extends BaseController {
    /**
     * @route POST /api/v1/consultations
     * @access Doctor
     */
    async createConsultation(req, res) {
        try {
            const data = {
                ...req.body,
                doctorId: req.user.userId,
                createdBy: req.user.userId
            };
            
            const result = await ConsultationService.createConsultation(data);

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

    async listMyConsultations(req, res) {
        try {
            const doctorId = req.user.userId;
            const includeCompleted = req.query.includeCompleted !== 'false';
            
            const result = await ConsultationService.getDoctorConsultations(doctorId, includeCompleted);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: result.message || 'Consultations retrieved successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * @route GET /api/v1/consultations
     * @access Doctor, Nurse
     */
    async getAllConsultations(req, res) {
        try {
            const { patientId, doctorId, status, dateFrom, dateTo, page, limit } = req.query;
            
            const filters = {};
            if (patientId) filters.patientId = patientId;
            if (doctorId) filters.doctorId = doctorId;
            if (status) filters.status = status;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const result = await ConsultationService.getAllConsultations(
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
                message: 'Consultations retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * @route GET /api/v1/consultations/:id
     * @access Doctor, Nurse
     */
    async getConsultationById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await ConsultationService.getConsultationById(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            const { userId, role } = req.user;
            const consultation = result.data;
            
            const canAccess = 
                role === 'admin' ||
                role === 'nurse' ||
                consultation.doctorId._id.toString() === userId ||
                consultation.patientId._id.toString() === userId;

            if (!canAccess) {
                return this.handleError(res, {
                    message: 'You do not have permission to view this consultation',
                    statusCode: HTTP_STATUS.FORBIDDEN
                });
            }

            return this.handleSuccess(res, {
                message: 'Consultation retrieved successfully',
                data: consultation
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * @route PUT /api/v1/consultations/:id
     * @access Doctor
     */
    async updateConsultation(req, res) {
        try {
            const { id } = req.params;
            
            const result = await ConsultationService.updateConsultation(id, req.body);

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

    async completeConsultation(req, res) {
        try {
            const { id } = req.params;
            
            const result = await ConsultationService.completeConsultation(id);

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

    async addVitalSigns(req, res) {
        try {
            const { id } = req.params;
            const vitalSigns = req.body;
            
            const updateData = { vitalSigns };
            const result = await ConsultationService.updateConsultation(id, updateData);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Vital signs added successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async addDiagnosis(req, res) {
        try {
            const { id } = req.params;
            const diagnosisData = req.body;
            
            const updateData = { 
                diagnosis: diagnosisData.primaryDiagnosis,
                secondaryDiagnosis: diagnosisData.secondaryDiagnosis,
                icdCodes: diagnosisData.icdCodes,
                severity: diagnosisData.severity,
                diagnosisNotes: diagnosisData.notes
            };
            
            const result = await ConsultationService.updateConsultation(id, updateData);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Diagnosis added successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getPatientHistory(req, res) {
        try {
            const { patientId } = req.params;
            const doctorId = req.query.doctorId || null;
            
            const result = await ConsultationService.getPatientHistory(patientId, doctorId);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Patient consultation history retrieved successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async deleteConsultation(req, res) {
        try {
            const { id } = req.params;
            
            const result = await ConsultationService.deleteConsultation(id);

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
}

export default ConsultationController;
