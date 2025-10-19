import Patient from '../models/Patient.js';

class PatientService {
    async createPatient(data) {
        const patient = new Patient(data);
        return await patient.save();
    }

    async getPatientById(id) {
        return await Patient.findById(id);
    }

    async getAllPatients(filters = {}) {
        return await Patient.find(filters);
    }

    async updatePatient(id, data) {
        return await Patient.findByIdAndUpdate(id, data, { new: true });
    }

    async deletePatient(id) {
        return await Patient.findByIdAndDelete(id);
    }
}

export default new PatientService();
