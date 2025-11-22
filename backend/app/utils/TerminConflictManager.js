/**
 * Termin Conflict Manager
 * Handles appointment scheduling conflicts and availability checks
 */

import Termin from '../models/Termin.js';
import User from '../models/User.js';
import Logger from '../logs/Logger.js';

class TerminConflictManager {
    /**
     * Check if doctor is available at the requested time
     * @param {ObjectId} doctorId - Doctor's user ID
     * @param {Date} date - Appointment date
     * @param {String} startTime - Start time (HH:MM format)
     * @param {String} endTime - End time (HH:MM format)
     * @param {ObjectId} excludeTerminId - Exclude specific termin (for updates)
     * @returns {Object} { available: boolean, conflicts: [], reason: string }
     */
    static async checkDoctorAvailability(doctorId, date, startTime, endTime, excludeTerminId = null) {
        try {
            // Check for overlapping appointments
            const conflicts = await this.findConflictingTermins(doctorId, date, startTime, endTime, excludeTerminId);
            
            if (conflicts.length > 0) {
                return {
                    available: false,
                    conflicts,
                    reason: 'Doctor has conflicting appointments at this time'
                };
            }

            // Check doctor's working hours
            const workingHoursCheck = await this.checkDoctorWorkingHours(doctorId, date, startTime, endTime);
            if (!workingHoursCheck.available) {
                return workingHoursCheck;
            }

            // Check break times
            const breakTimeCheck = await this.checkBreakTimes(doctorId, date, startTime, endTime);
            if (!breakTimeCheck.available) {
                return breakTimeCheck;
            }

            // Check holidays/days off
            const holidayCheck = await this.checkHolidays(doctorId, date);
            if (!holidayCheck.available) {
                return holidayCheck;
            }

            return {
                available: true,
                conflicts: [],
                reason: 'Time slot is available'
            };

        } catch (error) {
            Logger.error('Error checking doctor availability', error);
            throw error;
        }
    }

    /**
     * Find conflicting appointments for a doctor
     */
    static async findConflictingTermins(doctorId, date, startTime, endTime, excludeTerminId = null) {
        try {
            const dateStart = new Date(date);
            dateStart.setHours(0, 0, 0, 0);
            
            const dateEnd = new Date(date);
            dateEnd.setHours(23, 59, 59, 999);

            const query = {
                doctorId,
                date: {
                    $gte: dateStart,
                    $lte: dateEnd
                },
                status: { $nin: ['cancelled', 'no-show'] }
            };

            if (excludeTerminId) {
                query._id = { $ne: excludeTerminId };
            }

            const existingTermins = await Termin.find(query);

            // Check for time overlap
            const conflicts = existingTermins.filter(termin => {
                return this.timesOverlap(
                    startTime, endTime,
                    termin.startTime, termin.endTime
                );
            });

            return conflicts;

        } catch (error) {
            Logger.error('Error finding conflicting termins', error);
            throw error;
        }
    }

    /**
     * Check if two time ranges overlap
     */
    static timesOverlap(start1, end1, start2, end2) {
        const toMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const start1Min = toMinutes(start1);
        const end1Min = toMinutes(end1);
        const start2Min = toMinutes(start2);
        const end2Min = toMinutes(end2);

        return (start1Min < end2Min && end1Min > start2Min);
    }

    /**
     * Check doctor's working hours
     * This can be extended to check against doctor's schedule in User model
     */
    static async checkDoctorWorkingHours(doctorId, date, startTime, endTime) {
        try {
            const doctor = await User.findById(doctorId);
            
            if (!doctor) {
                return {
                    available: false,
                    reason: 'Doctor not found'
                };
            }

            // If doctor has workingHours defined in the model
            if (doctor.workingHours && doctor.workingHours.length > 0) {
                const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
                
                const daySchedule = doctor.workingHours.find(wh => wh.day === dayOfWeek);
                
                if (!daySchedule || daySchedule.isClosed) {
                    return {
                        available: false,
                        reason: `Doctor is not available on ${dayOfWeek}s`
                    };
                }

                // Check if appointment is within working hours
                if (daySchedule.openTime && daySchedule.closeTime) {
                    const appointmentStart = this.timeToMinutes(startTime);
                    const appointmentEnd = this.timeToMinutes(endTime);
                    const workStart = this.timeToMinutes(daySchedule.openTime);
                    const workEnd = this.timeToMinutes(daySchedule.closeTime);

                    if (appointmentStart < workStart || appointmentEnd > workEnd) {
                        return {
                            available: false,
                            reason: `Appointment is outside doctor's working hours (${daySchedule.openTime} - ${daySchedule.closeTime})`
                        };
                    }
                }
            }

            return { available: true };

        } catch (error) {
            Logger.error('Error checking doctor working hours', error);
            return { available: true }; // If no schedule defined, allow booking
        }
    }

    /**
     * Check break times (lunch break, etc.)
     * أوقات الاستراحة
     */
    static async checkBreakTimes(doctorId, date, startTime, endTime) {
        try {
            const doctor = await User.findById(doctorId);
            
            if (!doctor || !doctor.breakTimes) {
                return { available: true };
            }

            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
            
            const dayBreaks = doctor.breakTimes?.filter(bt => bt.day === dayOfWeek) || [];

            for (const breakTime of dayBreaks) {
                if (this.timesOverlap(startTime, endTime, breakTime.start, breakTime.end)) {
                    return {
                        available: false,
                        reason: `Time conflicts with doctor's break time (${breakTime.start} - ${breakTime.end})`
                    };
                }
            }

            return { available: true };

        } catch (error) {
            Logger.error('Error checking break times', error);
            return { available: true };
        }
    }

    /**
     * Check holidays and days off
     * أيام العطل
     */
    static async checkHolidays(doctorId, date) {
        try {
            const doctor = await User.findById(doctorId);
            
            if (!doctor || !doctor.daysOff) {
                return { available: true };
            }

            // Check if the date is in doctor's days off
            const dateStr = date.toISOString().split('T')[0];
            const isDayOff = doctor.daysOff?.some(dayOff => {
                const dayOffStr = new Date(dayOff).toISOString().split('T')[0];
                return dayOffStr === dateStr;
            });

            if (isDayOff) {
                return {
                    available: false,
                    reason: 'Doctor is on holiday/day off on this date'
                };
            }

            return { available: true };

        } catch (error) {
            Logger.error('Error checking holidays', error);
            return { available: true };
        }
    }

    /**
     * Get available time slots for a doctor on a specific date
     * @param {ObjectId} doctorId 
     * @param {Date} date 
     * @param {Number} duration - Duration in minutes
     * @returns {Array} Array of available time slots
     */
    static async getAvailableTimeSlots(doctorId, date, duration = 30) {
        try {
            const doctor = await User.findById(doctorId);
            if (!doctor) {
                return [];
            }

            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
            
            // Get working hours for the day
            const daySchedule = doctor.workingHours?.find(wh => wh.day === dayOfWeek);
            
            if (!daySchedule || daySchedule.isClosed) {
                return [];
            }

            const workStart = daySchedule.openTime || '08:00';
            const workEnd = daySchedule.closeTime || '17:00';

            // Generate all possible time slots
            const allSlots = this.generateTimeSlots(workStart, workEnd, duration);

            // Get existing appointments
            const dateStart = new Date(date);
            dateStart.setHours(0, 0, 0, 0);
            const dateEnd = new Date(date);
            dateEnd.setHours(23, 59, 59, 999);

            const existingTermins = await Termin.find({
                doctorId,
                date: { $gte: dateStart, $lte: dateEnd },
                status: { $nin: ['cancelled', 'no-show'] }
            });

            // Filter out occupied and break time slots
            const availableSlots = [];
            
            for (const slot of allSlots) {
                const endTime = this.addMinutesToTime(slot, duration);
                
                // Check conflicts
                const hasConflict = existingTermins.some(termin => 
                    this.timesOverlap(slot, endTime, termin.startTime, termin.endTime)
                );

                // Check break times
                const breakConflict = doctor.breakTimes?.some(bt => 
                    bt.day === dayOfWeek && this.timesOverlap(slot, endTime, bt.start, bt.end)
                );

                if (!hasConflict && !breakConflict) {
                    availableSlots.push({
                        startTime: slot,
                        endTime: endTime,
                        duration: duration
                    });
                }
            }

            return availableSlots;

        } catch (error) {
            Logger.error('Error getting available time slots', error);
            return [];
        }
    }

    /**
     * Find available doctors for a specific date and time
     */
    static async findAvailableDoctors(date, startTime, endTime, specialization = null) {
        try {
            const query = {
                role: 'doctor', // Adjust based on your role system
                isActive: true
            };

            if (specialization) {
                query.specialization = specialization;
            }

            const doctors = await User.find(query);
            const availableDoctors = [];

            for (const doctor of doctors) {
                const availability = await this.checkDoctorAvailability(
                    doctor._id,
                    date,
                    startTime,
                    endTime
                );

                if (availability.available) {
                    availableDoctors.push({
                        doctorId: doctor._id,
                        name: `${doctor.fname} ${doctor.lname}`,
                        specialization: doctor.specialization,
                        availableSlots: await this.getAvailableTimeSlots(doctor._id, date)
                    });
                }
            }

            return availableDoctors;

        } catch (error) {
            Logger.error('Error finding available doctors', error);
            return [];
        }
    }

    /**
     * Helper: Convert time string to minutes
     */
    static timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Helper: Generate time slots between start and end
     */
    static generateTimeSlots(startTime, endTime, intervalMinutes) {
        const slots = [];
        let current = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);

        while (current + intervalMinutes <= end) {
            const hours = Math.floor(current / 60);
            const minutes = current % 60;
            slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
            current += intervalMinutes;
        }

        return slots;
    }

    /**
     * Helper: Add minutes to a time string
     */
    static addMinutesToTime(time, minutes) {
        const totalMinutes = this.timeToMinutes(time) + minutes;
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    /**
     * Suggest alternative time slots when requested slot is not available
     */
    static async suggestAlternativeSlots(doctorId, date, duration = 30, count = 5) {
        try {
            const availableSlots = await this.getAvailableTimeSlots(doctorId, date, duration);
            return availableSlots.slice(0, count);
        } catch (error) {
            Logger.error('Error suggesting alternative slots', error);
            return [];
        }
    }
}

export default TerminConflictManager;