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

    static async getPharmacyStats() {
        try {
            const [total, active, suspended, pending] = await Promise.all([
                Pharmacy.countDocuments(),
                Pharmacy.countDocuments({ status: 'active' }),
                Pharmacy.countDocuments({ status: 'suspended' }),
                Pharmacy.countDocuments({ status: 'pending_approval' })
            ]);

            const stats = {
                total,
                active,
                suspended,
                pending,
                withDelivery: await Pharmacy.countDocuments({ 'deliveryService.available': true }),
                with24HService: await Pharmacy.countDocuments({ services: '24h_service' })
            };

            return { success: true, data: stats };
        } catch (error) {
            Logger.error('Error getting pharmacy stats', error);
            throw error;
        }
    }

    static async getNearbyPharmacies(latitude, longitude, radius) {
        try {
            const pharmacies = await Pharmacy.find({
                status: 'active',
                'address.coordinates': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: radius * 1000 // Convert km to meters
                    }
                }
            }).limit(20);

            return { success: true, data: pharmacies };
        } catch (error) {
            Logger.error('Error getting nearby pharmacies', error);
            throw error;
        }
    }

    static async searchByServices(services, city) {
        try {
            const query = {
                status: 'active',
                services: { $in: services }
            };

            if (city) {
                query['address.city'] = new RegExp(city, 'i');
            }

            const pharmacies = await Pharmacy.find(query).limit(50);

            return { success: true, data: pharmacies };
        } catch (error) {
            Logger.error('Error searching pharmacies by services', error);
            throw error;
        }
    }

    static async verifyPharmacy(pharmacyId) {
        try {
            const pharmacy = await Pharmacy.findByIdAndUpdate(
                pharmacyId,
                { 
                    status: 'active',
                    verifiedAt: new Date()
                },
                { new: true }
            );
            
            if (!pharmacy) {
                return { success: false, message: 'Pharmacy not found' };
            }
            
            Logger.info('Pharmacy verified', { pharmacyId });
            return { success: true, message: 'Pharmacy verified successfully', data: pharmacy };
        } catch (error) {
            Logger.error('Error verifying pharmacy', error);
            throw error;
        }
    }

    static async addPharmacist(pharmacyId, pharmacistData) {
        try {
            const pharmacy = await Pharmacy.findByIdAndUpdate(
                pharmacyId,
                { $push: { pharmacists: pharmacistData } },
                { new: true, runValidators: true }
            );
            
            if (!pharmacy) {
                return { success: false, message: 'Pharmacy not found' };
            }
            
            Logger.info('Pharmacist added to pharmacy', { pharmacyId, pharmacistData });
            return { success: true, message: 'Pharmacist added successfully', data: pharmacy };
        } catch (error) {
            Logger.error('Error adding pharmacist', error);
            throw error;
        }
    }
}

export default PharmacyService;
