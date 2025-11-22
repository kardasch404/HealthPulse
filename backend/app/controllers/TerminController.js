import BaseController from '../abstractions/BaseController.js';
import TerminService from '../services/TerminService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class TerminController extends BaseController {
    /**
     * @route POST /api/v1/termins
     * @access Doctor, Nurse, Patient
     */
    async createTermin(req, res) {
        try {
            const data = {
                ...req.body,
                createdBy: req.user.userId
            };

            const result = await TerminService.createTermin(data);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST,
                    data: {
                        conflicts: result.conflicts,
                        alternatives: result.alternatives
                    }
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
     * @route GET /api/v1/termins/:id
     * @access Doctor, Nurse, Patient
     */
    async getTerminById(req, res) {
        try {
            const { id } = req.params;
            const result = await TerminService.getTerminById(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            const { userId, role } = req.user;
            const termin = result.data;
            
            const canAccess = 
                role === 'admin' ||
                termin.doctorId._id.toString() === userId ||
                termin.patientId._id.toString() === userId ||
                role === 'reception' ||
                role === 'nurse';

            if (!canAccess) {
                return this.handleError(res, {
                    message: 'You do not have access to this appointment',
                    statusCode: HTTP_STATUS.FORBIDDEN
                });
            }

            return this.handleSuccess(res, {
                message: 'Appointment retrieved successfully',
                data: termin
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * @route GET /api/v1/termins
     * @access Doctor, Nurse
     */
    async getAllTermins(req, res) {
        try {
            const { role } = req.user;
            
            if (!['admin', 'nurse', 'reception'].includes(role)) {
                return this.handleError(res, {
                    message: 'Access denied. Insufficient permissions.',
                    statusCode: HTTP_STATUS.FORBIDDEN
                });
            }

            const { patientId, doctorId, status, type, dateFrom, dateTo, page, limit } = req.query;
            
            const filters = {};
            if (patientId) filters.patientId = patientId;
            if (doctorId) filters.doctorId = doctorId;
            if (status) filters.status = status;
            if (type) filters.type = type;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;

            const result = await TerminService.getAllTermins(
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
                message: 'All appointments retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getPatientTermins(req, res) {
        try {
            const { patientId } = req.params;
            const { includeCompleted } = req.query;
            
            const result = await TerminService.getPatientTermins(
                patientId,
                includeCompleted !== 'false'
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Patient appointments retrieved successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getDoctorSchedule(req, res) {
        try {
            const { doctorId } = req.params;
            const { dateFrom, dateTo } = req.query;

            if (!dateFrom || !dateTo) {
                return this.handleError(res, {
                    message: 'dateFrom and dateTo are required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await TerminService.getDoctorSchedule(doctorId, dateFrom, dateTo);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Doctor schedule retrieved successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async checkAvailability(req, res) {
        try {
            const { doctorId } = req.params;
            const { date, duration } = req.query;

            if (!date) {
                return this.handleError(res, {
                    message: 'Date is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await TerminService.checkAvailability(
                doctorId,
                date,
                duration ? parseInt(duration) : 30
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Availability checked successfully',
                ...result
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async findAvailableDoctors(req, res) {
        try {
            const { date, startTime, endTime, specialization } = req.query;

            if (!date || !startTime || !endTime) {
                return this.handleError(res, {
                    message: 'date, startTime, and endTime are required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await TerminService.findAvailableDoctors(
                date,
                startTime,
                endTime,
                specialization || null
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Available doctors found successfully',
                ...result
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * @route PUT /api/v1/termins/:id
     * @access Doctor, Nurse
     */
    async updateTermin(req, res) {
        try {
            const { id } = req.params;
            
            const result = await TerminService.updateTermin(id, req.body);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST,
                    data: result.conflicts ? { conflicts: result.conflicts } : undefined
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

    async confirmTermin(req, res) {
        try {
            const { id } = req.params;
            
            const result = await TerminService.confirmTermin(id);

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

    async cancelTermin(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!reason) {
                return this.handleError(res, {
                    message: 'Cancellation reason is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await TerminService.cancelTermin(id, reason);

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

    async completeTermin(req, res) {
        try {
            const { id } = req.params;
            
            const result = await TerminService.completeTermin(id);

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

    async getUpcomingTermins(req, res) {
        try {
            const { doctorId, patientId, days } = req.query;
            
            const result = await TerminService.getUpcomingTermins(
                doctorId || null,
                patientId || null,
                days ? parseInt(days) : 7
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Upcoming appointments retrieved successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getTodayTermins(req, res) {
        try {
            const { doctorId } = req.params;
            
            const result = await TerminService.getTodayTermins(doctorId);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: "Today's appointments retrieved successfully",
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async rescheduleTermin(req, res) {
        try {
            const { id } = req.params;
            const { newDate, newStartTime, newDuration } = req.body;

            if (!newDate || !newStartTime) {
                return this.handleError(res, {
                    message: 'newDate and newStartTime are required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await TerminService.rescheduleTermin(
                id,
                newDate,
                newStartTime,
                newDuration || null
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST,
                    data: {
                        conflicts: result.conflicts,
                        alternatives: result.alternatives
                    }
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
}

export default TerminController;