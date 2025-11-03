import Laboratory from '../models/Laboratory.js';
import Logger from '../logs/Logger.js';

class LaboratoryService {
    static async registerLaboratory(data) {
        try {
            // The model now supports flat fields directly, no transformation needed
            const laboratory = new Laboratory(data);
            await laboratory.save();
            Logger.info('Laboratory registered', { laboratoryId: laboratory._id });
            return { success: true, message: 'Laboratory registered successfully', data: laboratory };
        } catch (error) {
            Logger.error('Error registering laboratory', error);
            throw error;
        }
    }

    static async getLaboratoryById(laboratoryId) {
        try {
            const laboratory = await Laboratory.findById(laboratoryId);
            if (!laboratory) {
                return { success: false, message: 'Laboratory not found' };
            }
            return { success: true, data: laboratory };
        } catch (error) {
            Logger.error('Error getting laboratory', error);
            throw error;
        }
    }

    static async getAllLaboratories(filters = {}, page = 1, limit = 10) {
        try {
            const { status, city, testType } = filters;
            const query = {};

            if (status) query.status = status;
            if (city) query['address.city'] = new RegExp(city, 'i');
            if (testType) query['testCatalog.availableTests.testType'] = testType;

            const skip = (page - 1) * limit;
            const [laboratories, total] = await Promise.all([
                Laboratory.find(query).sort({ name: 1 }).skip(skip).limit(limit),
                Laboratory.countDocuments(query)
            ]);

            return {
                success: true,
                data: laboratories,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            };
        } catch (error) {
            Logger.error('Error getting laboratories', error);
            throw error;
        }
    }

    static async updateLaboratory(laboratoryId, updates) {
        try {
            const laboratory = await Laboratory.findByIdAndUpdate(laboratoryId, updates, { new: true, runValidators: true });
            if (!laboratory) {
                return { success: false, message: 'Laboratory not found' };
            }
            Logger.info('Laboratory updated', { laboratoryId });
            return { success: true, message: 'Laboratory updated successfully', data: laboratory };
        } catch (error) {
            Logger.error('Error updating laboratory', error);
            throw error;
        }
    }

    static async activateLaboratory(laboratoryId) {
        try {
            const laboratory = await Laboratory.findByIdAndUpdate(laboratoryId, { status: 'active' }, { new: true });
            if (!laboratory) {
                return { success: false, message: 'Laboratory not found' };
            }
            Logger.info('Laboratory activated', { laboratoryId });
            return { success: true, message: 'Laboratory activated successfully', data: laboratory };
        } catch (error) {
            Logger.error('Error activating laboratory', error);
            throw error;
        }
    }

    static async suspendLaboratory(laboratoryId, reason, options = {}) {
        try {
            const updateData = {
                status: 'suspended',
                suspensionReason: reason,
                suspendedAt: new Date()
            };

            // Add optional suspension details
            if (options.duration || options.notifyStaff !== undefined || options.allowEmergency !== undefined) {
                updateData.suspensionDetails = {
                    duration: options.duration,
                    notifyStaff: options.notifyStaff,
                    allowEmergency: options.allowEmergency
                };
            }

            const laboratory = await Laboratory.findByIdAndUpdate(
                laboratoryId,
                updateData,
                { new: true }
            );
            
            if (!laboratory) {
                return { success: false, message: 'Laboratory not found' };
            }
            
            Logger.info('Laboratory suspended', { laboratoryId, reason });
            return { success: true, message: 'Laboratory suspended successfully', data: laboratory };
        } catch (error) {
            Logger.error('Error suspending laboratory', error);
            throw error;
        }
    }

    static async deleteLaboratory(laboratoryId) {
        try {
            const laboratory = await Laboratory.findByIdAndDelete(laboratoryId);
            if (!laboratory) {
                return { success: false, message: 'Laboratory not found' };
            }
            Logger.info('Laboratory deleted', { laboratoryId });
            return { success: true, message: 'Laboratory deleted successfully' };
        } catch (error) {
            Logger.error('Error deleting laboratory', error);
            throw error;
        }
    }

    static async searchLaboratories(searchTerm) {
        try {
            const laboratories = await Laboratory.find({
                $or: [
                    { name: new RegExp(searchTerm, 'i') },
                    { 'address.city': new RegExp(searchTerm, 'i') }
                ],
                status: 'active'
            }).limit(20);

            return { success: true, data: laboratories };
        } catch (error) {
            Logger.error('Error searching laboratories', error);
            throw error;
        }
    }
}

export default LaboratoryService;
