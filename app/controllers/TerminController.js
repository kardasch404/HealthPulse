import TerminService from '../services/TerminService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class TerminController {
    constructor() {
        this.terminService = new TerminService();
    }

    /**
     * Get available doctors for a specific date
     * GET /api/v1/termins/available?date=2025-10-20
     */
    async getAvailableDoctors(req, res) {
        const { date } = req.query;

        if (!date) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Date is required'
            });
        }

        const availableDoctors = await this.terminService.getAvailableDoctors(date);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Available doctors retrieved successfully',
            data: {
                date,
                doctors: availableDoctors
            }
        });
    }

    /**
     * Create a termin
     * POST /api/v1/termins
     */
    async createTermin(req, res) {
        const terminData = req.body;
        const createdBy = req.user.userId;

        const termin = await this.terminService.createTermin(terminData, createdBy);

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Termin created successfully',
            data: termin
        });
    }

    /**
     * Get my termins (doctor or patient)
     * GET /api/v1/termins/my
     */
    async getMyTermins(req, res) {
        const { userId, role } = req.user;
        const { date, status } = req.query;

        const filters = {};
        if (date) filters.date = date;
        if (status) filters.status = status;

        let termins;
        if (role === 'doctor') {
            termins = await this.terminService.getDoctorTermins(userId, filters);
        } else if (role === 'patient') {
            termins = await this.terminService.getPatientTermins(userId, filters);
        } else {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Only doctors and patients can view their termins'
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Termins retrieved successfully',
            data: termins
        });
    }

    /**
     * Get all appointments with filters (no pagination)
     * GET /api/v1/termins/all
     */
    async getAllTermins(req, res) {
        const { role } = req.user;
        
        // Only admin, nurse, and reception can view all appointments
        if (!['admin', 'nurse', 'reception'].includes(role)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        const {
            date,
            status,
            doctorId,
            patientId,
            type,
            sortBy = 'date',
            sortOrder = 'asc'
        } = req.query;

        const filters = {};
        if (date) filters.date = date;
        if (status) filters.status = status;
        if (doctorId) filters.doctorId = doctorId;
        if (patientId) filters.patientId = patientId;
        if (type) filters.type = type;

        const options = {
            sortBy,
            sortOrder
        };

        const termins = await this.terminService.getAllTermins(filters, options);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'All appointments retrieved successfully',
            data: termins
        });
    }

    /**
     * Get termin by ID
     * GET /api/v1/termins/:id
     */
    async getTerminById(req, res) {
        const { id } = req.params;
        const termin = await this.terminService.getTerminById(id);

        // Check if user has access to this termin
        const { userId, role } = req.user;
        const canAccess = 
            role === 'admin' ||
            termin.doctorId._id.toString() === userId ||
            termin.patientId._id.toString() === userId ||
            role === 'reception' ||
            role === 'nurse';

        if (!canAccess) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'You do not have access to this termin'
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Termin retrieved successfully',
            data: termin
        });
    }

    /**
     * Cancel termin
     * PUT /api/v1/termins/:id/cancel
     */
    async cancelTermin(req, res) {
        const { id } = req.params;
        const { reason } = req.body;

        const termin = await this.terminService.cancelTermin(id, reason);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Termin cancelled successfully',
            data: termin
        });
    }

    /**
     * Complete termin
     * PUT /api/v1/termins/:id/complete
     */
    async completeTermin(req, res) {
        const { id } = req.params;

        const termin = await this.terminService.completeTermin(id);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Termin completed successfully',
            data: termin
        });
    }
}

export default TerminController;