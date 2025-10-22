import Termin from '../models/Termin.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';
import Logger from '../logs/Logger.js';

class TerminService {
    /**
     * Get available doctors for a specific date
     * Returns doctors who have free slots on that date
     */
    async getAvailableDoctors(date) {
        // Get all active doctors
        const doctorRole = await Role.findOne({ name: 'doctor' });
        if (!doctorRole) {
            throw new NotFoundError('Doctor role not found');
        }

        const doctors = await User.find({
            roleId: doctorRole._id,
            isActive: true
        }).select('-password');

        // For each doctor, check availability
        const availableDoctors = [];

        for (const doctor of doctors) {
            const slots = await this.getDoctorAvailableSlots(doctor._id, date);
            if (slots.length > 0) {
                availableDoctors.push({
                    doctor: {
                        _id: doctor._id,
                        fname: doctor.fname,
                        lname: doctor.lname,
                        email: doctor.email
                    },
                    availableSlots: slots
                });
            }
        }

        return availableDoctors;
    }

    /**
     * Get available time slots for a specific doctor on a specific date
     * Each slot is 30 minutes, max 8 slots per day (4 hours)
     */
    async getDoctorAvailableSlots(doctorId, date) {
        // Define working hours (you can make this configurable per doctor)
        const workingHours = {
            start: '09:00',
            end: '17:00'  // 8 hours total work time
        };

        const slotDuration = 30; // minutes
        const maxSlots = 8; // max appointments per day

        // Get existing appointments for this doctor on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedTermins = await Termin.find({
            doctorId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $nin: ['cancelled', 'no-show'] }
        }).select('startTime endTime');

        // Generate all possible slots
        const allSlots = this.generateTimeSlots(workingHours.start, workingHours.end, slotDuration, maxSlots);

        // Filter out booked slots
        const availableSlots = allSlots.filter(slot => {
            return !this.isSlotBooked(slot, bookedTermins);
        });

        return availableSlots;
    }

    /**
     * Generate time slots
     */
    generateTimeSlots(startTime, endTime, duration, maxSlots) {
        const slots = [];
        let [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        let currentMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        let slotCount = 0;

        while (currentMinutes < endMinutes && slotCount < maxSlots) {
            const slotEndMinutes = currentMinutes + duration;
            
            if (slotEndMinutes > endMinutes) break;

            const startH = Math.floor(currentMinutes / 60);
            const startM = currentMinutes % 60;
            const endH = Math.floor(slotEndMinutes / 60);
            const endM = slotEndMinutes % 60;

            slots.push({
                startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
                endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
            });

            currentMinutes = slotEndMinutes;
            slotCount++;
        }

        return slots;
    }

    /**
     * Check if a slot is already booked
     */
    isSlotBooked(slot, bookedTermins) {
        return bookedTermins.some(termin => {
            return termin.startTime === slot.startTime;
        });
    }

    /**
     * Create/Book a termin
     */
    async createTermin(data, createdBy) {
        const { doctorId, patientId, date, startTime, type, notes } = data;

        // Verify doctor exists and is active
        const doctor = await User.findById(doctorId).populate('roleId');
        if (!doctor) {
            throw new NotFoundError('Doctor not found');
        }
        if (doctor.roleId.name !== 'doctor') {
            throw new BadRequestError('Selected user is not a doctor');
        }
        if (!doctor.isActive) {
            throw new BadRequestError('Doctor is not active');
        }

        // Verify patient exists and is active
        const patient = await User.findById(patientId).populate('roleId');
        if (!patient) {
            throw new NotFoundError('Patient not found');
        }
        if (patient.roleId.name !== 'patient') {
            throw new BadRequestError('Selected user is not a patient');
        }
        if (!patient.isActive) {
            throw new BadRequestError('Patient is not active');
        }

        // Check if the slot is available
        const availableSlots = await this.getDoctorAvailableSlots(doctorId, date);
        const requestedSlot = availableSlots.find(slot => slot.startTime === startTime);

        if (!requestedSlot) {
            throw new ConflictError('Selected time slot is not available');
        }

        // Create the termin
        const termin = await Termin.create({
            doctorId,
            patientId,
            date: new Date(date),
            startTime: requestedSlot.startTime,
            endTime: requestedSlot.endTime,
            duration: 30,
            status: 'scheduled',
            type: type || 'consultation',
            notes,
            createdBy
        });

        Logger.info(`Termin created: ${termin._id} for patient ${patientId} with doctor ${doctorId}`);

        return await Termin.findById(termin._id)
            .populate('doctorId', 'fname lname email')
            .populate('patientId', 'fname lname email')
            .populate('createdBy', 'fname lname');
    }

    /**
     * Get termins for a doctor
     */
    async getDoctorTermins(doctorId, filters = {}) {
        const query = { doctorId };

        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        if (filters.status) {
            query.status = filters.status;
        }

        return await Termin.find(query)
            .populate('patientId', 'fname lname email phone')
            .populate('createdBy', 'fname lname')
            .sort({ date: 1, startTime: 1 });
    }

    /**
     * Get termins for a patient
     */
    async getPatientTermins(patientId, filters = {}) {
        const query = { patientId };

        if (filters.status) {
            query.status = filters.status;
        }

        return await Termin.find(query)
            .populate('doctorId', 'fname lname email')
            .populate('createdBy', 'fname lname')
            .sort({ date: -1, startTime: -1 });
    }

    /**
     * Get termin by ID
     */
    async getTerminById(terminId) {
        const termin = await Termin.findById(terminId)
            .populate('doctorId', 'fname lname email')
            .populate('patientId', 'fname lname email phone')
            .populate('createdBy', 'fname lname');

        if (!termin) {
            throw new NotFoundError('Termin not found');
        }

        return termin;
    }

    /**
     * Update termin status
     */
    async updateTerminStatus(terminId, status, reason = null) {
        const termin = await Termin.findById(terminId);
        if (!termin) {
            throw new NotFoundError('Termin not found');
        }

        termin.status = status;

        if (status === 'cancelled') {
            termin.cancelledAt = new Date();
            if (reason) termin.cancelReason = reason;
        }

        if (status === 'completed') {
            termin.completedAt = new Date();
        }

        await termin.save();

        Logger.info(`Termin ${terminId} status updated to ${status}`);

        return this.getTerminById(terminId);
    }

    /**
     * Cancel termin
     */
    async cancelTermin(terminId, reason) {
        return this.updateTerminStatus(terminId, 'cancelled', reason);
    }

    /**
     * Complete termin
     */
    async completeTermin(terminId) {
        return this.updateTerminStatus(terminId, 'completed');
    }
}

export default TerminService;
