import BaseController from '../abstractions/BaseController.js';
import UserService from '../services/UserService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { ROLES } from '../constants/roles.js';
import Role from '../models/Role.js';

class PatientController extends BaseController {
    constructor() {
        super();
        this.userService = new UserService();
    }

    /**
     * Create a new patient
     * @route POST /api/v1/patients
     * @access Doctor, Nurse, Reception, Admin
     */
    async createPatient(req, res) {
        try {
            // Get patient role ID
            const patientRole = await Role.findOne({ name: ROLES.PATIENT });
            if (!patientRole) {
                return this.handleError(res, {
                    message: 'Patient role not found',
                    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
                });
            }

            // Add patient role to request body
            const patientData = {
                ...req.body,
                roleId: patientRole._id
            };

            const patient = await this.userService.createUser(patientData);

            return this.handleSuccess(res, {
                message: 'Patient created successfully',
                data: patient
            }, HTTP_STATUS.CREATED);
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get all patients
     * @route GET /api/v1/patients
     * @access Doctor, Nurse, Reception, Admin
     */
    async getAllPatients(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            
            // Get patient role ID
            const patientRole = await Role.findOne({ name: ROLES.PATIENT });
            if (!patientRole) {
                return this.handleError(res, {
                    message: 'Patient role not found',
                    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
                });
            }

            const filters = {
                role: ROLES.PATIENT,
                search
            };

            const result = await this.userService.getAllUsers(filters, parseInt(page), parseInt(limit));

            return this.handleSuccess(res, {
                message: 'Patients retrieved successfully',
                data: result.users,
                pagination: result.pagination
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get patient by ID
     * @route GET /api/v1/patients/:id
     * @access Doctor, Nurse, Reception, Admin, Patient (own)
     */
    async getPatientById(req, res) {
        try {
            const { id } = req.params;
            
            const patient = await this.userService.getUserById(id);

            // Verify it's actually a patient
            const patientRole = await Role.findOne({ name: ROLES.PATIENT });
            if (patient.roleId.toString() !== patientRole._id.toString()) {
                return this.handleError(res, {
                    message: 'User is not a patient',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Patient retrieved successfully',
                data: patient
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Update patient
     * @route PUT /api/v1/patients/:id
     * @access Doctor, Nurse, Reception, Admin, Patient (own)
     */
    async updatePatient(req, res) {
        try {
            const { id } = req.params;
            
            const patient = await this.userService.updateUser(id, req.body);

            return this.handleSuccess(res, {
                message: 'Patient updated successfully',
                data: patient
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Delete/Deactivate patient
     * @route DELETE /api/v1/patients/:id
     * @access Admin only
     */
    async deletePatient(req, res) {
        try {
            const { id } = req.params;
            
            await this.userService.deleteUser(id);

            return this.handleSuccess(res, {
                message: 'Patient deactivated successfully'
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Search patients
     * @route GET /api/v1/patients/search
     * @access Doctor, Nurse, Reception, Admin
     */
    async searchPatients(req, res) {
        try {
            const { q, limit = 10 } = req.query;
            
            if (!q) {
                return this.handleError(res, {
                    message: 'Search query is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const filters = {
                role: ROLES.PATIENT,
                search: q
            };

            const result = await this.userService.getAllUsers(filters, 1, parseInt(limit));

            return this.handleSuccess(res, {
                message: 'Search results',
                data: result.users
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get patient medical history
     * @route GET /api/v1/patients/:id/medical-history
     * @access Doctor, Nurse, Admin, Patient (own)
     */
    async getPatientMedicalHistory(req, res) {
        try {
            const { id } = req.params;
            const { 
                includeConsultations = true, 
                includePrescriptions = true, 
                includeLabOrders = true,
                fromDate,
                toDate 
            } = req.query;

            // Verify patient exists
            const patient = await this.userService.getUserById(id);
            
            // Here you would gather medical history from consultations, prescriptions, etc.
            // For now, return a placeholder structure
            const medicalHistory = {
                patient: patient,
                consultations: includeConsultations ? [] : undefined,
                prescriptions: includePrescriptions ? [] : undefined,
                labOrders: includeLabOrders ? [] : undefined,
                dateRange: {
                    from: fromDate || null,
                    to: toDate || null
                }
            };

            return this.handleSuccess(res, {
                message: 'Patient medical history retrieved successfully',
                data: medicalHistory
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }
}

export default PatientController;
