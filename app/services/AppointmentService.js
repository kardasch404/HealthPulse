import Termin from '../models/Termin.js';
import { APPOINTMENT_STATUS } from '../constants/statusCodes.js';

class AppointmentService {
    async createAppointment(data) {
        const appointment = new Termin(data);
        return await appointment.save();
    }

    async getAppointmentById(id) {
        return await Termin.findById(id).populate('patientId doctorId');
    }

    async getAllAppointments(filters = {}) {
        return await Termin.find(filters).populate('patientId doctorId');
    }

    async updateAppointment(id, data) {
        return await Termin.findByIdAndUpdate(id, data, { new: true });
    }

    async cancelAppointment(id) {
        return await Termin.findByIdAndUpdate(
            id, 
            { status: APPOINTMENT_STATUS.CANCELLED }, 
            { new: true }
        );
    }
}

export default new AppointmentService();
