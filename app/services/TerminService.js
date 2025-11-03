
import Termin from '../models/Termin.js';
import User from '../models/User.js';
import Logger from '../logs/Logger.js';
import TerminConflictManager from '../utils/TerminConflictManager.js';

class TerminService {
    static async createTermin(data) {
        try {
            const { patientId, doctorId, date, startTime, duration, type, notes, createdBy } = data;

            const endTime = TerminConflictManager.addMinutesToTime(startTime, duration);

            const availability = await TerminConflictManager.checkDoctorAvailability(
                doctorId,
                new Date(date),
                startTime,
                endTime
            );

            if (!availability.available) {
                const alternatives = await TerminConflictManager.suggestAlternativeSlots(
                    doctorId,
                    new Date(date),
                    duration
                );

                return {
                    success: false,
                    message: availability.reason,
                    conflicts: availability.conflicts,
                    alternatives
                };
            }

            const termin = new Termin({
                patientId,
                doctorId,
                date: new Date(date),
                startTime,
                endTime,
                duration,
                status: 'scheduled',
                type: type || 'consultation',
                notes,
                createdBy,
                reminderSent: false
            });

            await termin.save();

            Logger.info('Termin created successfully', { terminId: termin._id });

            return {
                success: true,
                message: 'Appointment booked successfully',
                data: termin
            };

        } catch (error) {
            Logger.error('Error creating termin', error);
            throw error;
        }
    }

    static async getTerminById(terminId) {
        try {
            const termin = await Termin.findById(terminId)
                .populate('patientId', 'fname lname email phone')
                .populate('doctorId', 'fname lname email specialization')
                .populate('createdBy', 'fname lname');

            if (!termin) {
                return {
                    success: false,
                    message: 'Appointment not found'
                };
            }

            return {
                success: true,
                data: termin
            };

        } catch (error) {
            Logger.error('Error getting termin by ID', error);
            throw error;
        }
    }

    static async getAllTermins(filters = {}, page = 1, limit = 10) {
        try {
            const {
                patientId,
                doctorId,
                status,
                type,
                dateFrom,
                dateTo
            } = filters;

            const query = {};

            if (patientId) query.patientId = patientId;
            if (doctorId) query.doctorId = doctorId;
            if (status) query.status = status;
            if (type) query.type = type;

            if (dateFrom || dateTo) {
                query.date = {};
                if (dateFrom) query.date.$gte = new Date(dateFrom);
                if (dateTo) query.date.$lte = new Date(dateTo);
            }

            const skip = (page - 1) * limit;

            const [termins, total] = await Promise.all([
                Termin.find(query)
                    .populate('patientId', 'fname lname email phone')
                    .populate('doctorId', 'fname lname email specialization')
                    .sort({ date: 1, startTime: 1 })
                    .skip(skip)
                    .limit(limit),
                Termin.countDocuments(query)
            ]);

            return {
                success: true,
                data: termins,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            Logger.error('Error getting all termins', error);
            throw error;
        }
    }

    static async getPatientTermins(patientId, includeCompleted = false) {
        try {
            const query = { patientId };
            
            if (!includeCompleted) {
                query.status = { $nin: ['completed', 'cancelled'] };
            }

            const termins = await Termin.find(query)
                .populate('doctorId', 'fname lname specialization')
                .sort({ date: 1, startTime: 1 });

            return {
                success: true,
                data: termins
            };

        } catch (error) {
            Logger.error('Error getting patient termins', error);
            throw error;
        }
    }

    static async getDoctorSchedule(doctorId, dateFrom, dateTo) {
        try {
            const termins = await Termin.find({
                doctorId,
                date: {
                    $gte: new Date(dateFrom),
                    $lte: new Date(dateTo)
                },
                status: { $nin: ['cancelled', 'no-show'] }
            })
            .populate('patientId', 'fname lname phone')
            .sort({ date: 1, startTime: 1 });

            return {
                success: true,
                data: termins
            };

        } catch (error) {
            Logger.error('Error getting doctor schedule', error);
            throw error;
        }
    }

    static async checkAvailability(doctorId, date, duration = 30) {
        try {
            const availableSlots = await TerminConflictManager.getAvailableTimeSlots(
                doctorId,
                new Date(date),
                duration
            );

            return {
                success: true,
                date,
                doctorId,
                availableSlots,
                count: availableSlots.length
            };

        } catch (error) {
            Logger.error('Error checking availability', error);
            throw error;
        }
    }

    static async findAvailableDoctors(date, startTime, endTime, specialization = null) {
        try {
            const doctors = await TerminConflictManager.findAvailableDoctors(
                new Date(date),
                startTime,
                endTime,
                specialization
            );

            return {
                success: true,
                date,
                timeSlot: { startTime, endTime },
                availableDoctors: doctors,
                count: doctors.length
            };

        } catch (error) {
            Logger.error('Error finding available doctors', error);
            throw error;
        }
    }

    static async updateTermin(terminId, updates) {
        try {
            const termin = await Termin.findById(terminId);

            if (!termin) {
                return {
                    success: false,
                    message: 'Appointment not found'
                };
            }

            if (updates.date || updates.startTime || updates.duration) {
                const newDate = updates.date ? new Date(updates.date) : termin.date;
                const newStartTime = updates.startTime || termin.startTime;
                const newDuration = updates.duration || termin.duration;
                const newEndTime = TerminConflictManager.addMinutesToTime(newStartTime, newDuration);

                const availability = await TerminConflictManager.checkDoctorAvailability(
                    termin.doctorId,
                    newDate,
                    newStartTime,
                    newEndTime,
                    terminId
                );

                if (!availability.available) {
                    return {
                        success: false,
                        message: availability.reason,
                        conflicts: availability.conflicts
                    };
                }

                updates.endTime = newEndTime;
            }

            Object.assign(termin, updates);
            await termin.save();

            Logger.info('Termin updated successfully', { terminId });

            return {
                success: true,
                message: 'Appointment updated successfully',
                data: termin
            };

        } catch (error) {
            Logger.error('Error updating termin', error);
            throw error;
        }
    }

    static async updateStatus(terminId, status, reason = null) {
        try {
            const validStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
            
            if (!validStatuses.includes(status)) {
                return {
                    success: false,
                    message: 'Invalid status'
                };
            }

            const termin = await Termin.findById(terminId);

            if (!termin) {
                return {
                    success: false,
                    message: 'Appointment not found'
                };
            }

            termin.status = status;

            if (status === 'cancelled' && reason) {
                termin.cancelReason = reason;
                termin.cancelledAt = new Date();
            }

            if (status === 'completed') {
                termin.completedAt = new Date();
            }

            await termin.save();

            Logger.info('Termin status updated', { terminId, status });

            return {
                success: true,
                message: `Appointment ${status} successfully`,
                data: termin
            };

        } catch (error) {
            Logger.error('Error updating termin status', error);
            throw error;
        }
    }

    static async confirmTermin(terminId) {
        return this.updateStatus(terminId, 'confirmed');
    }

    static async cancelTermin(terminId, reason) {
        return this.updateStatus(terminId, 'cancelled', reason);
    }

    static async completeTermin(terminId) {
        return this.updateStatus(terminId, 'completed');
    }

    static async deleteTermin(terminId, reason = 'Deleted by user') {
        try {
            return this.cancelTermin(terminId, reason);
        } catch (error) {
            Logger.error('Error deleting termin', error);
            throw error;
        }
    }

    static async getUpcomingTermins(doctorId = null, patientId = null, days = 7) {
        try {
            const query = {
                date: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
                },
                status: { $in: ['scheduled', 'confirmed'] }
            };

            if (doctorId) query.doctorId = doctorId;
            if (patientId) query.patientId = patientId;

            const termins = await Termin.find(query)
                .populate('patientId', 'fname lname phone')
                .populate('doctorId', 'fname lname specialization')
                .sort({ date: 1, startTime: 1 });

            return {
                success: true,
                data: termins
            };

        } catch (error) {
            Logger.error('Error getting upcoming termins', error);
            throw error;
        }
    }

    static async getTodayTermins(doctorId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const termins = await Termin.find({
                doctorId,
                date: {
                    $gte: today,
                    $lt: tomorrow
                }
            })
            .populate('patientId', 'fname lname phone')
            .sort({ startTime: 1 });

            return {
                success: true,
                data: termins
            };

        } catch (error) {
            Logger.error('Error getting today termins', error);
            throw error;
        }
    }

    static async rescheduleTermin(terminId, newDate, newStartTime, newDuration = null) {
        try {
            const termin = await Termin.findById(terminId);

            if (!termin) {
                return {
                    success: false,
                    message: 'Appointment not found'
                };
            }

            const duration = newDuration || termin.duration;
            const endTime = TerminConflictManager.addMinutesToTime(newStartTime, duration);

            const availability = await TerminConflictManager.checkDoctorAvailability(
                termin.doctorId,
                new Date(newDate),
                newStartTime,
                endTime,
                terminId
            );

            if (!availability.available) {
                const alternatives = await TerminConflictManager.suggestAlternativeSlots(
                    termin.doctorId,
                    new Date(newDate),
                    duration
                );

                return {
                    success: false,
                    message: availability.reason,
                    conflicts: availability.conflicts,
                    alternatives
                };
            }

            termin.date = new Date(newDate);
            termin.startTime = newStartTime;
            termin.endTime = endTime;
            termin.duration = duration;
            termin.status = 'scheduled';
            termin.reminderSent = false;

            await termin.save();

            Logger.info('Termin rescheduled successfully', { terminId });

            return {
                success: true,
                message: 'Appointment rescheduled successfully',
                data: termin
            };

        } catch (error) {
            Logger.error('Error rescheduling termin', error);
            throw error;
        }
    }
}

export default TerminService;
