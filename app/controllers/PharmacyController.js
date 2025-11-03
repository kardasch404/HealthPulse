import BaseController from '../abstractions/BaseController.js';
import PharmacyService from '../services/PharmacyService.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

class PharmacyController extends BaseController {
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
     * @route GET /api/v1/pharmacies
     * @access Public
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
     * @route GET /api/v1/pharmacies/:id
     * @access Public
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
     * @route PUT /api/v1/pharmacies/:id
     * @access Admin
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

    async getPharmacyStats(req, res) {
        try {
            const result = await PharmacyService.getPharmacyStats();

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Pharmacy statistics retrieved successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async getNearbyPharmacies(req, res) {
        try {
            const { latitude, longitude, radius = 10 } = req.query;

            if (!latitude || !longitude) {
                return this.handleError(res, {
                    message: 'Latitude and longitude are required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const result = await PharmacyService.getNearbyPharmacies(
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(radius)
            );

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            return this.handleSuccess(res, {
                message: 'Nearby pharmacies retrieved successfully',
                data: result.data
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async searchByServices(req, res) {
        try {
            const { services, city } = req.query;

            if (!services) {
                return this.handleError(res, {
                    message: 'Services parameter is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }

            const serviceArray = services.split(',');
            const result = await PharmacyService.searchByServices(serviceArray, city);

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

    async verifyPharmacy(req, res) {
        try {
            const { id } = req.params;
            
            const result = await PharmacyService.verifyPharmacy(id);

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

    async addPharmacist(req, res) {
        try {
            const { id } = req.params;
            const pharmacistData = req.body;

            if (!pharmacistData.userId && !pharmacistData.name) {
                return this.handleError(res, {
                    message: 'Pharmacist user ID or name is required',
                    statusCode: HTTP_STATUS.BAD_REQUEST
                });
            }
            
            const result = await PharmacyService.addPharmacist(id, pharmacistData);

            if (!result.success) {
                return this.handleError(res, {
                    message: result.message,
                    statusCode: HTTP_STATUS.NOT_FOUND
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
}

export default PharmacyController;