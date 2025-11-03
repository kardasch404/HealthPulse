import Consultation from '../models/Consultation.js';
import Termin from '../models/Termin.js';
import User from '../models/User.js';
import Logger from '../logs/Logger.js';

class ConsultationService {
    static async createConsultation(data) {
        try {
            const { appointmentId, patientId, doctorId, chiefComplaint, symptoms, createdBy } = data;

            if (appointmentId) {
                const appointment = await Termin.findById(appointmentId);
                if (!appointment) {
                    return { success: false, message: 'Appointment not found' };
                }
                if (appointment.patientId.toString() !== patientId || appointment.doctorId.toString() !== doctorId) {
                    return { success: false, message: 'Appointment does not match patient/doctor' };
                }
            }

            const consultation = new Consultation({
                appointmentId,
                patientId,
                doctorId,
                chiefComplaint,
                symptoms: symptoms || [],
                status: 'in-progress',
                createdBy
            });

            await consultation.save();
            Logger.info('Consultation created', { consultationId: consultation._id });

            return { success: true, message: 'Consultation created successfully', data: consultation };
        } catch (error) {
            Logger.error('Error creating consultation', error);
            throw error;
        }
    }

    static async getConsultationById(consultationId) {
        try {
            const consultation = await Consultation.findById(consultationId)
                .populate('patientId', 'fname lname email phone')
                .populate('doctorId', 'fname lname email specialization')
                .populate('createdBy', 'fname lname email')
                .populate('appointmentId')
                .populate('prescriptionId');

            if (!consultation) {
                return { success: false, message: 'Consultation not found' };
            }

            return { success: true, data: consultation };
        } catch (error) {
            Logger.error('Error getting consultation', error);
            throw error;
        }
    }

    static async getAllConsultations(filters = {}, page = 1, limit = 10) {
        try {
            const { patientId, doctorId, status, dateFrom, dateTo } = filters;
            const query = {};

            if (patientId) query.patientId = patientId;
            if (doctorId) query.doctorId = doctorId;
            if (status) query.status = status;
            if (dateFrom || dateTo) {
                query.createdAt = {};
                if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
                if (dateTo) query.createdAt.$lte = new Date(dateTo);
            }

            const skip = (page - 1) * limit;
            const [consultations, total] = await Promise.all([
                Consultation.find(query)
                    .populate('patientId', 'fname lname email phone')
                    .populate('doctorId', 'fname lname specialization')
                    .populate('createdBy', 'fname lname email')
                    .populate('appointmentId')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Consultation.countDocuments(query)
            ]);

            return {
                success: true,
                data: consultations,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            };
        } catch (error) {
            Logger.error('Error getting consultations', error);
            throw error;
        }
    }

    static async getDoctorConsultations(doctorId, includeCompleted = true) {
        try {
            const query = { doctorId };
            if (!includeCompleted) {
                query.status = { $ne: 'completed' };
            }

            const consultations = await Consultation.find(query)
                .populate('patientId', 'fname lname phone')
                .populate('appointmentId')
                .populate('createdBy', 'fname lname email')
                .sort({ createdAt: -1 });

            return { success: true, data: consultations };
        } catch (error) {
            Logger.error('Error getting doctor consultations', error);
            throw error;
        }
    }

    static async getPatientHistory(patientId, doctorId = null) {
        try {
            const query = { patientId, status: 'completed' };
            if (doctorId) query.doctorId = doctorId;

            const consultations = await Consultation.find(query)
                .populate('doctorId', 'fname lname specialization')
                .populate('prescriptionId')
                .populate('createdBy', 'fname lname email')
                .sort({ createdAt: -1 });

            return { success: true, data: consultations };
        } catch (error) {
            Logger.error('Error getting patient history', error);
            throw error;
        }
    }

    static async updateConsultation(consultationId, updates) {
        try {
            const consultation = await Consultation.findById(consultationId);
            if (!consultation) {
                return { success: false, message: 'Consultation not found' };
            }

            if (consultation.status === 'completed') {
                return { success: false, message: 'Cannot update completed consultation' };
            }

            Object.assign(consultation, updates);
            await consultation.save();

            Logger.info('Consultation updated', { consultationId });
            return { success: true, message: 'Consultation updated successfully', data: consultation };
        } catch (error) {
            Logger.error('Error updating consultation', error);
            throw error;
        }
    }

    static async completeConsultation(consultationId) {
        try {
            const consultation = await Consultation.findById(consultationId);
            if (!consultation) {
                return { success: false, message: 'Consultation not found' };
            }

            consultation.status = 'completed';
            await consultation.save();

            if (consultation.appointmentId) {
                await Termin.findByIdAndUpdate(consultation.appointmentId, { status: 'completed' });
            }

            Logger.info('Consultation completed', { consultationId });
            return { success: true, message: 'Consultation completed successfully', data: consultation };
        } catch (error) {
            Logger.error('Error completing consultation', error);
            throw error;
        }
    }

    static async deleteConsultation(consultationId) {
        try {
            const consultation = await Consultation.findById(consultationId);
            if (!consultation) {
                return { success: false, message: 'Consultation not found' };
            }

            if (consultation.status === 'completed') {
                return { success: false, message: 'Cannot delete completed consultation' };
            }

            consultation.status = 'cancelled';
            await consultation.save();

            Logger.info('Consultation deleted', { consultationId });
            return { success: true, message: 'Consultation deleted successfully' };
        } catch (error) {
            Logger.error('Error deleting consultation', error);
            throw error;
        }
    }
}

export default ConsultationService;
