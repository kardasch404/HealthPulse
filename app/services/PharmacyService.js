import Pharmacy from '../models/Pharmacy.js';
import Logger from '../logs/Logger.js';

class PharmacyService {
    static async registerPharmacy(data) {
        try {
            const pharmacy = new Pharmacy(data);
            await pharmacy.save();
            Logger.info('Pharmacy registered', { pharmacyId: pharmacy._id });
            return { success: true, message: 'Pharmacy registered successfully', data: pharmacy };
        } catch (error) {
            Logger.error('Error registering pharmacy', error);
            throw error;
        }
    }

    static async getPharmacyById(pharmacyId) {
        try {
            const pharmacy = await Pharmacy.findById(pharmacyId);
            if (!pharmacy) {
                return { success: false, message: 'Pharmacy not found' };
            }
            return { success: true, data: pharmacy };
        } catch (error) {
            Logger.error('Error getting pharmacy', error);
            throw error;
        }
    }

    static async getAllPharmacies(filters = {}, page = 1, limit = 10) {
        try {
            const { status, city, hasDelivery } = filters;
            const query = {};

            if (status) query.status = status;
            if (city) query['address.city'] = new RegExp(city, 'i');
            if (hasDelivery !== undefined) query['deliveryOptions.homeDelivery' ] = hasDelivery;

            const skip = (page - 1) * limit;
            const [pharmacies, total] = await Promise.all([
                Pharmacy.find(query).sort({ name: 1 }).skip(skip).limit(limit),
                Pharmacy.countDocuments(query)
            ]);

            return {
                success: true,
                data: pharmacies,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            };
        } catch (error) {
            Logger.error('Error getting pharmacies', error);
            throw error;
        }
    }

    static async updatePharmacy(pharmacyId, updates) {
        try {
            const pharmacy = await Pharmacy.findByIdAndUpdate(pharmacyId, updates, { new: true, runValidators: true });
            if (!pharmacy) {
                return { success: false, message: 'Pharmacy not found' };
            }
            Logger.info('Pharmacy updated', { pharmacyId });
            return { success: true, message: 'Pharmacy updated successfully', data: pharmacy };
        } catch (error) {
            Logger.error('Error updating pharmacy', error);
            throw error;
        }
    }

    static async activatePharmacy(pharmacyId) {
        try {
            const pharmacy = await Pharmacy.findByIdAndUpdate(pharmacyId, { status: 'active' }, { new: true });
            if (!pharmacy) {
                return { success: false, message: 'Pharmacy not found' };
            }
            Logger.info('Pharmacy activated', { pharmacyId });
            return { success: true, message: 'Pharmacy activated successfully', data: pharmacy };
        } catch (error) {
            Logger.error('Error activating pharmacy', error);
            throw error;
        }
    }

    static async suspendPharmacy(pharmacyId, reason) {
        try {
            const pharmacy = await Pharmacy.findByIdAndUpdate(
                pharmacyId,
                { status: 'suspended', suspensionReason: reason },
                { new: true }
            );
            if (!pharmacy) {
                return { success: false, message: 'Pharmacy not found' };
            }
            Logger.info('Pharmacy suspended', { pharmacyId });
            return { success: true, message: 'Pharmacy suspended successfully', data: pharmacy };
        } catch (error) {
            Logger.error('Error suspending pharmacy', error);
            throw error;
        }
    }

    static async deletePharmacy(pharmacyId) {
        try {
            const pharmacy = await Pharmacy.findByIdAndDelete(pharmacyId);
            if (!pharmacy) {
                return { success: false, message: 'Pharmacy not found' };
            }
            Logger.info('Pharmacy deleted', { pharmacyId });
            return { success: true, message: 'Pharmacy deleted successfully' };
        } catch (error) {
            Logger.error('Error deleting pharmacy', error);
            throw error;
        }
    }

    static async searchPharmacies(searchTerm) {
        try {
            const pharmacies = await Pharmacy.find({
                $or: [
                    { name: new RegExp(searchTerm, 'i') },
                    { 'address.city': new RegExp(searchTerm, 'i') },
                    { 'address.street': new RegExp(searchTerm, 'i') }
                ],
                status: 'active'
            }).limit(20);

            return { success: true, data: pharmacies };
        } catch (error) {
            Logger.error('Error searching pharmacies', error);
            throw error;
        }
    }
}

export default PharmacyService;
