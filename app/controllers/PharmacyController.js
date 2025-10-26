import BaseController from '../abstractions/BaseController.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class PharmacyController extends BaseController {
    constructor(pharmacyService) {
        super();
        this.pharmacyService = pharmacyService;
    }

    /**
     * Create a new pharmacy
     * @route POST /api/v1/pharmacies
     * @access Admin only
     */
    async createPharmacy(req, res) {
        try {
            const pharmacy = await this.pharmacyService.createPharmacy(req.body);

            return this.handleSuccess(res, {
                message: 'Pharmacy registered successfully',
                data: pharmacy
            }, HTTP_STATUS.CREATED);
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get all pharmacies with filters and pagination
     * @route GET /api/v1/pharmacies
     * @access Admin, Pharmacist
     */
    async getAllPharmacies(req, res) {
        try {
            const {
                page,
                limit,
                sortBy,
                sortOrder,
                status,
                city,
                search,
                isVerified,
                services
            } = req.query;

            const filters = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc'
            };

            // Add query filters
            if (status) filters.status = status;
            if (city) filters.city = city;
            if (search) filters.search = search;
            if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
            if (services) {
                filters.services = Array.isArray(services) ? services : [services];
            }

            const result = await this.pharmacyService.getAllPharmacies(filters);

            return this.handleSuccess(res, {
                message: 'Pharmacies retrieved successfully',
                ...result
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get pharmacy by ID
     * @route GET /api/v1/pharmacies/:id
     * @access Admin, Pharmacist
     */
    async getPharmacyById(req, res) {
        try {
            const { id } = req.params;
            const includePrivate = req.user?.role === 'admin';
            
            const pharmacy = await this.pharmacyService.getPharmacyById(id, includePrivate);

            return this.handleSuccess(res, {
                message: 'Pharmacy retrieved successfully',
                data: pharmacy
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Update pharmacy
     * @route PUT /api/v1/pharmacies/:id
     * @access Admin only
     */
    async updatePharmacy(req, res) {
        try {
            const { id } = req.params;
            const pharmacy = await this.pharmacyService.updatePharmacy(id, req.body);

            return this.handleSuccess(res, {
                message: 'Pharmacy updated successfully',
                data: pharmacy
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Delete pharmacy (soft delete)
     * @route DELETE /api/v1/pharmacies/:id
     * @access Admin only
     */
    async deletePharmacy(req, res) {
        try {
            const { id } = req.params;
            await this.pharmacyService.deletePharmacy(id);

            return this.handleSuccess(res, {
                message: 'Pharmacy deleted successfully'
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Activate pharmacy
     * @route PATCH /api/v1/pharmacies/:id/activate
     * @access Admin only
     */
    async activatePharmacy(req, res) {
        try {
            const { id } = req.params;
            const pharmacy = await this.pharmacyService.activatePharmacy(id);

            return this.handleSuccess(res, {
                message: 'Pharmacy activated successfully',
                data: pharmacy
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Suspend pharmacy
     * @route PATCH /api/v1/pharmacies/:id/suspend
     * @access Admin only
     */
    async suspendPharmacy(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            
            const pharmacy = await this.pharmacyService.suspendPharmacy(id, reason);

            return this.handleSuccess(res, {
                message: 'Pharmacy suspended successfully',
                data: pharmacy
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Verify pharmacy
     * @route PATCH /api/v1/pharmacies/:id/verify
     * @access Admin only
     */
    async verifyPharmacy(req, res) {
        try {
            const { id } = req.params;
            const { notes } = req.body;
            const verifiedBy = req.user.userId;
            
            const pharmacy = await this.pharmacyService.verifyPharmacy(id, verifiedBy, notes);

            return this.handleSuccess(res, {
                message: 'Pharmacy verified successfully',
                data: pharmacy
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Add pharmacist to pharmacy
     * @route POST /api/v1/pharmacies/:id/pharmacists
     * @access Admin only
     */
    async addPharmacist(req, res) {
        try {
            const { id } = req.params;
            const pharmacy = await this.pharmacyService.addPharmacist(id, req.body);

            return this.handleSuccess(res, {
                message: 'Pharmacist added successfully',
                data: pharmacy
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get pharmacies by location
     * @route GET /api/v1/pharmacies/nearby
     * @access Public (authenticated)
     */
    async getNearbyPharmacies(req, res) {
        try {
            const { latitude, longitude, radius } = req.query;

            if (!latitude || !longitude) {
                return this.handleError(res, {
                    message: 'Latitude and longitude are required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const pharmacies = await this.pharmacyService.getPharmaciesByLocation(
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(radius) || 10
            );

            return this.handleSuccess(res, {
                message: 'Nearby pharmacies retrieved successfully',
                data: pharmacies
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Search pharmacies by services
     * @route GET /api/v1/pharmacies/search/services
     * @access Public (authenticated)
     */
    async searchByServices(req, res) {
        try {
            const { services, city } = req.query;

            if (!services) {
                return this.handleError(res, {
                    message: 'Services parameter is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const serviceArray = Array.isArray(services) ? services : [services];
            const filters = city ? { city } : {};

            const pharmacies = await this.pharmacyService.searchByServices(serviceArray, filters);

            return this.handleSuccess(res, {
                message: 'Pharmacies found successfully',
                data: pharmacies
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get pharmacy statistics (for dashboard)
     * @route GET /api/v1/pharmacies/stats
     * @access Admin only
     */
    async getPharmacyStats(req, res) {
        try {
            const { timeframe = '30' } = req.query; // days
            
            // This is a basic implementation - you can enhance with aggregation
            const stats = {
                totalPharmacies: await this.pharmacyService.getAllPharmacies({ status: undefined }).then(r => r.pagination.totalItems),
                activePharmacies: await this.pharmacyService.getAllPharmacies({ status: 'active' }).then(r => r.pagination.totalItems),
                pendingPharmacies: await this.pharmacyService.getAllPharmacies({ status: 'pending_approval' }).then(r => r.pagination.totalItems),
                suspendedPharmacies: await this.pharmacyService.getAllPharmacies({ status: 'suspended' }).then(r => r.pagination.totalItems),
                verifiedPharmacies: await this.pharmacyService.getAllPharmacies({ isVerified: true }).then(r => r.pagination.totalItems)
            };

            return this.handleSuccess(res, {
                message: 'Pharmacy statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }
}

export default PharmacyController;