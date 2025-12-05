import Prescription from '../models/Prescription.js';
import Consultation from '../models/Consultation.js';
import Pharmacy from '../models/Pharmacy.js';
import Logger from '../logs/Logger.js';

class PrescriptionService {
    static async createPrescription(data) {
        try {
            const { consultationId, patientId, doctorId, medications, notes, createdBy } = data;

            if (consultationId) {
                const consultation = await Consultation.findById(consultationId);
                if (!consultation) {
                    return { success: false, message: 'Consultation not found' };
                }
            }

            const prescription = new Prescription({
                consultationId,
                patientId,
                doctorId,
                medications: medications || [],
                notes,
                status: 'draft',
                createdBy
            });

            await prescription.save();

            if (consultationId) {
                await Consultation.findByIdAndUpdate(consultationId, { prescriptionId: prescription._id });
            }

            Logger.info('Prescription created', { prescriptionId: prescription._id });
            return { success: true, message: 'Prescription created successfully', data: prescription };
        } catch (error) {
            Logger.error('Error creating prescription', error);
            throw error;
        }
    }

    static async getPrescriptionById(prescriptionId) {
        try {
            const prescription = await Prescription.findById(prescriptionId)
                .populate('patientId', 'fname lname email phone')
                .populate('doctorId', 'fname lname email specialization')
                .populate('consultationId')
                .populate('assignedPharmacyId', 'name address phone');

            if (!prescription) {
                return { success: false, message: 'Prescription not found' };
            }

            return { success: true, data: prescription };
        } catch (error) {
            Logger.error('Error getting prescription', error);
            throw error;
        }
    }

    static async getAllPrescriptions(filters = {}, page = 1, limit = 10) {
        try {
            const { patientId, doctorId, pharmacyId, status, dateFrom, dateTo } = filters;
            const query = {};

            if (patientId) query.patientId = patientId;
            if (doctorId) query.doctorId = doctorId;
            if (pharmacyId) query.assignedPharmacyId = pharmacyId;
            if (status) query.status = status;
            if (dateFrom || dateTo) {
                query.createdAt = {};
                if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
                if (dateTo) query.createdAt.$lte = new Date(dateTo);
            }

            const skip = (page - 1) * limit;
            const [prescriptions, total] = await Promise.all([
                Prescription.find(query)
                    .populate('patientId', 'fname lname')
                    .populate('doctorId', 'fname lname')
                    .populate('assignedPharmacyId', 'name')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Prescription.countDocuments(query)
            ]);

            return {
                success: true,
                data: prescriptions,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            };
        } catch (error) {
            Logger.error('Error getting prescriptions', error);
            throw error;
        }
    }

    static async addMedication(prescriptionId, medication) {
        try {
            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                return { success: false, message: 'Prescription not found' };
            }

            if (prescription.status !== 'draft') {
                return { success: false, message: 'Can only add medication to draft prescriptions' };
            }

            prescription.medications.push(medication);
            await prescription.save();

            Logger.info('Medication added to prescription', { prescriptionId });
            return { success: true, message: 'Medication added successfully', data: prescription };
        } catch (error) {
            Logger.error('Error adding medication', error);
            throw error;
        }
    }

    static async updatePrescription(prescriptionId, updates) {
        try {
            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                return { success: false, message: 'Prescription not found' };
            }

            if (prescription.status !== 'draft') {
                return { success: false, message: 'Can only update draft prescriptions' };
            }

            Logger.info('Updating prescription', { 
                prescriptionId, 
                updates,
                currentMedications: prescription.medications.map(m => ({ id: m._id, name: m.medicationName }))
            });

            if (updates.medications && Array.isArray(updates.medications)) {
                for (const medicationUpdate of updates.medications) {
                    if (medicationUpdate.id) {
                        const medication = prescription.medications.id(medicationUpdate.id);
                        Logger.info('Looking for medication', { 
                            searchId: medicationUpdate.id, 
                            found: !!medication,
                            availableIds: prescription.medications.map(m => m._id.toString())
                        });
                        
                        if (medication) {
                            Object.keys(medicationUpdate).forEach(key => {
                                if (key !== 'id') {
                                    medication[key] = medicationUpdate[key];
                                }
                            });
                            Logger.info('Updated medication', { medicationId: medication._id, updatedFields: Object.keys(medicationUpdate) });
                        } else {
                            Logger.warn('Medication not found', { id: medicationUpdate.id });
                            return { success: false, message: `Medication with ID ${medicationUpdate.id} not found` };
                        }
                    } else {
                        prescription.medications.push(medicationUpdate);
                        Logger.info('Added new medication', { medication: medicationUpdate });
                    }
                }
                delete updates.medications;
            }

            Object.assign(prescription, updates);
            await prescription.save();

            Logger.info('Prescription updated successfully', { prescriptionId });
            return { success: true, message: 'Prescription updated successfully', data: prescription };
        } catch (error) {
            Logger.error('Error updating prescription', error);
            throw error;
        }
    }

    static async signPrescription(prescriptionId, doctorId) {
        try {
            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                return { success: false, message: 'Prescription not found' };
            }

            if (prescription.doctorId.toString() !== doctorId) {
                return { success: false, message: 'Only prescribing doctor can sign' };
            }

            if (prescription.status !== 'draft') {
                return { success: false, message: 'Prescription already signed' };
            }

            if (!prescription.medications || prescription.medications.length === 0) {
                return { success: false, message: 'Cannot sign empty prescription' };
            }

            await prescription.signPrescription(doctorId);

            Logger.info('Prescription signed', { prescriptionId });
            return { success: true, message: 'Prescription signed successfully', data: prescription };
        } catch (error) {
            Logger.error('Error signing prescription', error);
            throw error;
        }
    }

    static async assignToPharmacy(prescriptionId, pharmacyId) {
        try {
            const [prescription, pharmacy] = await Promise.all([
                Prescription.findById(prescriptionId),
                Pharmacy.findById(pharmacyId)
            ]);

            if (!prescription) {
                return { success: false, message: 'Prescription not found' };
            }

            if (!pharmacy) {
                return { success: false, message: 'Pharmacy not found' };
            }

            if (pharmacy.status !== 'active') {
                return { success: false, message: 'Pharmacy is not active' };
            }

            prescription.assignedPharmacyId = pharmacyId;
            prescription.assignedAt = new Date();
            await prescription.save();

            Logger.info('Prescription assigned to pharmacy', { prescriptionId, pharmacyId });
            return { success: true, message: 'Prescription assigned successfully', data: prescription };
        } catch (error) {
            Logger.error('Error assigning prescription', error);
            throw error;
        }
    }

    static async updateStatus(prescriptionId, status) {
        try {
            const validStatuses = ['draft', 'pending', 'assigned', 'in-preparation', 'ready', 'dispensed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return { success: false, message: 'Invalid status' };
            }

            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                return { success: false, message: 'Prescription not found' };
            }

            prescription.status = status;
            if (status === 'dispensed') {
                prescription.dispensedAt = new Date();
            }
            await prescription.save();

            Logger.info('Prescription status updated', { prescriptionId, status });
            return { success: true, message: `Prescription ${status}`, data: prescription };
        } catch (error) {
            Logger.error('Error updating prescription status', error);
            throw error;
        }
    }

    static async cancelPrescription(prescriptionId, reason) {
        try {
            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                return { success: false, message: 'Prescription not found' };
            }

            if (prescription.status === 'dispensed') {
                return { success: false, message: 'Cannot cancel dispensed prescription' };
            }

            prescription.status = 'cancelled';
            prescription.cancelReason = reason;
            await prescription.save();

            Logger.info('Prescription cancelled', { prescriptionId });
            return { success: true, message: 'Prescription cancelled successfully' };
        } catch (error) {
            Logger.error('Error cancelling prescription', error);
            throw error;
        }
    }

    static async getPharmacyPrescriptions(pharmacyId, status = null) {
        try {
            const query = { assignedPharmacyId: pharmacyId };
            if (status) query.status = status;

            const prescriptions = await Prescription.find(query)
                .populate('patientId', 'fname lname phone')
                .populate('doctorId', 'fname lname')
                .sort({ createdAt: -1 });

            return { success: true, data: prescriptions };
        } catch (error) {
            Logger.error('Error getting pharmacy prescriptions', error);
            throw error;
        }
    }
}

export default PrescriptionService;
