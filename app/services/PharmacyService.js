import BaseService from '../abstractions/BaseServise.js';
import Pharmacy from '../models/Pharmacy.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class PharmacyService extends BaseService {
    constructor() {
        super();
    }

    /**
     * Create a new pharmacy
     * @param {Object} pharmacyData - Pharmacy data
     * @returns {Promise<Object>} Created pharmacy
     */
    async createPharmacy(pharmacyData) {
        try {
            // Check if pharmacy with same license number exists
            const existingPharmacy = await Pharmacy.findOne({ 
                licenseNumber: pharmacyData.licenseNumber 
            });

            if (existingPharmacy) {
                throw new ValidationError('Pharmacy with this license number already exists');
            }

            // Create new pharmacy
            const pharmacy = new Pharmacy(pharmacyData);
            await pharmacy.save();

            return pharmacy;
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new ValidationError('Invalid pharmacy data', error.errors);
            }
            throw error;
        }
    }

    /**
     * Get all pharmacies with filters and pagination
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Pagination options
     * @returns {Promise<Object>} Pharmacies with pagination info
     */
    async getAllPharmacies(filters = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                ...queryFilters
            } = { ...filters, ...options };

            // Build query
            const query = {};

            // Status filter
            if (queryFilters.status) {
                query.status = queryFilters.status;
            }

            // City filter
            if (queryFilters.city) {
                query['address.city'] = new RegExp(queryFilters.city, 'i');
            }

            // Name search
            if (queryFilters.search) {
                query.$or = [
                    { name: new RegExp(queryFilters.search, 'i') },
                    { licenseNumber: new RegExp(queryFilters.search, 'i') },
                    { 'contact.email': new RegExp(queryFilters.search, 'i') }
                ];
            }

            // Verified filter
            if (queryFilters.isVerified !== undefined) {
                query['verificationStatus.isVerified'] = queryFilters.isVerified;
            }

            // Services filter
            if (queryFilters.services && queryFilters.services.length > 0) {
                query.services = { $in: queryFilters.services };
            }

            // Calculate pagination
            const skip = (page - 1) * limit;
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            // Execute query with pagination
            const [pharmacies, totalCount] = await Promise.all([
                Pharmacy.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .populate('pharmacists.userId', 'fname lname email')
                    .populate('verificationStatus.verifiedBy', 'fname lname')
                    .select('-bankingInfo.accountNumber -bankingInfo.iban -internalNotes'),
                
                Pharmacy.countDocuments(query)
            ]);

            return {
                data: pharmacies,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < Math.ceil(totalCount / limit),
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get pharmacy by ID
     * @param {string} pharmacyId - Pharmacy ID
     * @param {boolean} includePrivate - Include private fields
     * @returns {Promise<Object>} Pharmacy details
     */
    async getPharmacyById(pharmacyId, includePrivate = false) {
        try {
            let query = Pharmacy.findById(pharmacyId)
                .populate('pharmacists.userId', 'fname lname email phone')
                .populate('verificationStatus.verifiedBy', 'fname lname')
                .populate('ratings.patientId', 'fname lname');

            if (!includePrivate) {
                query = query.select('-bankingInfo.accountNumber -bankingInfo.iban -internalNotes');
            }

            const pharmacy = await query;

            if (!pharmacy) {
                throw new NotFoundError('Pharmacy not found');
            }

            return pharmacy;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new NotFoundError('Invalid pharmacy ID');
            }
            throw error;
        }
    }

    /**
     * Update pharmacy
     * @param {string} pharmacyId - Pharmacy ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated pharmacy
     */
    async updatePharmacy(pharmacyId, updateData) {
        try {
            // Check if pharmacy exists
            const pharmacy = await Pharmacy.findById(pharmacyId);
            if (!pharmacy) {
                throw new NotFoundError('Pharmacy not found');
            }

            // Check license number uniqueness if being updated
            if (updateData.licenseNumber && updateData.licenseNumber !== pharmacy.licenseNumber) {
                const existingPharmacy = await Pharmacy.findOne({
                    licenseNumber: updateData.licenseNumber,
                    _id: { $ne: pharmacyId }
                });

                if (existingPharmacy) {
                    throw new ValidationError('Pharmacy with this license number already exists');
                }
            }

            // Update pharmacy
            const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
                pharmacyId,
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            )
                .populate('pharmacists.userId', 'fname lname email')
                .populate('verificationStatus.verifiedBy', 'fname lname')
                .select('-bankingInfo.accountNumber -bankingInfo.iban -internalNotes');

            return updatedPharmacy;
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new ValidationError('Invalid update data', error.errors);
            }
            if (error.name === 'CastError') {
                throw new NotFoundError('Invalid pharmacy ID');
            }
            throw error;
        }
    }

    /**
     * Delete pharmacy (soft delete)
     * @param {string} pharmacyId - Pharmacy ID
     * @returns {Promise<void>}
     */
    async deletePharmacy(pharmacyId) {
        try {
            const pharmacy = await Pharmacy.findById(pharmacyId);
            if (!pharmacy) {
                throw new NotFoundError('Pharmacy not found');
            }

            // Soft delete by setting status to inactive
            await Pharmacy.findByIdAndUpdate(pharmacyId, {
                status: 'inactive',
                updatedAt: new Date()
            });

            return { message: 'Pharmacy deleted successfully' };
        } catch (error) {
            if (error.name === 'CastError') {
                throw new NotFoundError('Invalid pharmacy ID');
            }
            throw error;
        }
    }

    /**
     * Activate pharmacy
     * @param {string} pharmacyId - Pharmacy ID
     * @returns {Promise<Object>} Updated pharmacy
     */
    async activatePharmacy(pharmacyId) {
        try {
            const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
                pharmacyId,
                { status: 'active', updatedAt: new Date() },
                { new: true }
            ).select('-bankingInfo.accountNumber -bankingInfo.iban -internalNotes');

            if (!updatedPharmacy) {
                throw new NotFoundError('Pharmacy not found');
            }

            return updatedPharmacy;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new NotFoundError('Invalid pharmacy ID');
            }
            throw error;
        }
    }

    /**
     * Suspend pharmacy
     * @param {string} pharmacyId - Pharmacy ID
     * @param {string} reason - Suspension reason
     * @returns {Promise<Object>} Updated pharmacy
     */
    async suspendPharmacy(pharmacyId, reason = '') {
        try {
            const updateData = {
                status: 'suspended',
                updatedAt: new Date()
            };

            if (reason) {
                updateData.internalNotes = reason;
            }

            const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
                pharmacyId,
                updateData,
                { new: true }
            ).select('-bankingInfo.accountNumber -bankingInfo.iban -internalNotes');

            if (!updatedPharmacy) {
                throw new NotFoundError('Pharmacy not found');
            }

            return updatedPharmacy;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new NotFoundError('Invalid pharmacy ID');
            }
            throw error;
        }
    }

    /**
     * Verify pharmacy
     * @param {string} pharmacyId - Pharmacy ID
     * @param {string} verifiedBy - User ID who verified
     * @param {string} notes - Verification notes
     * @returns {Promise<Object>} Updated pharmacy
     */
    async verifyPharmacy(pharmacyId, verifiedBy, notes = '') {
        try {
            const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
                pharmacyId,
                {
                    'verificationStatus.isVerified': true,
                    'verificationStatus.verifiedBy': verifiedBy,
                    'verificationStatus.verifiedAt': new Date(),
                    'verificationStatus.verificationNotes': notes,
                    status: 'active',
                    updatedAt: new Date()
                },
                { new: true }
            )
                .populate('verificationStatus.verifiedBy', 'fname lname')
                .select('-bankingInfo.accountNumber -bankingInfo.iban -internalNotes');

            if (!updatedPharmacy) {
                throw new NotFoundError('Pharmacy not found');
            }

            return updatedPharmacy;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new NotFoundError('Invalid pharmacy ID');
            }
            throw error;
        }
    }

    /**
     * Add pharmacist to pharmacy
     * @param {string} pharmacyId - Pharmacy ID
     * @param {Object} pharmacistData - Pharmacist data
     * @returns {Promise<Object>} Updated pharmacy
     */
    async addPharmacist(pharmacyId, pharmacistData) {
        try {
            const pharmacy = await Pharmacy.findById(pharmacyId);
            if (!pharmacy) {
                throw new NotFoundError('Pharmacy not found');
            }

            // Check if pharmacist already exists
            const existingPharmacist = pharmacy.pharmacists.find(
                p => p.licenseNumber === pharmacistData.licenseNumber
            );

            if (existingPharmacist) {
                throw new ValidationError('Pharmacist with this license number already exists in this pharmacy');
            }

            pharmacy.pharmacists.push(pharmacistData);
            await pharmacy.save();

            return await this.getPharmacyById(pharmacyId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get pharmacies by location
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude  
     * @param {number} radius - Radius in kilometers
     * @returns {Promise<Array>} Nearby pharmacies
     */
    async getPharmaciesByLocation(latitude, longitude, radius = 10) {
        try {
            // Convert radius to radians (radius in km / Earth's radius)
            const radiusInRadians = radius / 6371;

            const pharmacies = await Pharmacy.find({
                status: 'active',
                'address.coordinates': {
                    $geoWithin: {
                        $centerSphere: [[longitude, latitude], radiusInRadians]
                    }
                }
            })
                .select('name address contact services deliveryService stats')
                .sort({ 'stats.averageRating': -1 });

            return pharmacies;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search pharmacies by services
     * @param {Array} services - Array of required services
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Matching pharmacies
     */
    async searchByServices(services, filters = {}) {
        try {
            const query = {
                status: 'active',
                services: { $all: services }
            };

            // Add city filter if provided
            if (filters.city) {
                query['address.city'] = new RegExp(filters.city, 'i');
            }

            const pharmacies = await Pharmacy.find(query)
                .select('name address contact services deliveryService stats operatingHours')
                .sort({ 'stats.averageRating': -1 });

            return pharmacies;
        } catch (error) {
            throw error;
        }
    }
}

export default PharmacyService;