import BaseController from '../abstractions/BaseController.js';
import PharmacyService from '../services/PharmacyService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class PharmacyController extends BaseController {
    /**
     * Register a new pharmacy
     * @route POST /api/v1/pharmacies
     * @access Admin only
     */
    async registerPharmacy(req, res) {
        try {
            const result = await PharmacyService.registerPharmacy(req.body);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: result.message,
                data: result.data
            }, HTTP_STATUS.CREATED);
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get all pharmacies with filters and pagination
     * @route GET /api/v1/pharmacies
     * @access Admin, Pharmacist, Doctor
     */
    async getAllPharmacies(req, res) {
        try {
            const { page, limit, status, city, hasDelivery } = req.query;

            const filters = {};
            if (status) filters.status = status;
            if (city) filters.city = city;
            if (hasDelivery !== undefined) filters.hasDelivery = hasDelivery === 'true';

            const result = await PharmacyService.getAllPharmacies(
                filters,
                parseInt(page) || 1,
                parseInt(limit) || 10
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Pharmacies retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Get pharmacy by ID
     * @route GET /api/v1/pharmacies/:id
     * @access Admin, Pharmacist, Doctor
     */
    async getPharmacyById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await PharmacyService.getPharmacyById(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: 'Pharmacy retrieved successfully',
                data: result.data
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
            
            const result = await PharmacyService.updatePharmacy(id, req.body);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: result.message,
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Delete pharmacy
     * @route DELETE /api/v1/pharmacies/:id
     * @access Admin only
     */
    async deletePharmacy(req, res) {
        try {
            const { id } = req.params;
            
            const result = await PharmacyService.deletePharmacy(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: result.message
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
            
            const result = await PharmacyService.activatePharmacy(id);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: result.message,
                data: result.data
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

            if (!reason) {
                return this.handleError(res, {
                    message: 'Suspension reason is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await PharmacyService.suspendPharmacy(id, reason);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
                });
            }

            return this.handleSuccess(res, {
                message: result.message,
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Search pharmacies
     * @route GET /api/v1/pharmacies/search
     * @access Public (authenticated)
     */
    async searchPharmacies(req, res) {
        try {
            const { q } = req.query;

            if (!q) {
                return this.handleError(res, {
                    message: 'Search term is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const result = await PharmacyService.searchPharmacies(q);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Pharmacies found successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }
}

export default PharmacyController;