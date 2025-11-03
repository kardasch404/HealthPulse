import LabOrder from '../models/LabOrder.js';
import Consultation from '../models/Consultation.js';
import Laboratory from '../models/Laboratory.js';
import User from '../models/User.js';
import Logger from '../logs/Logger.js';

class LabOrderService {
    // ========================================
    // CREATE
    // ========================================
    static async createLabOrder(data) {
        try {
            const {
                consultationId,
                patientId,
                doctorId,
                laboratoryId,
                tests,
                clinicalIndication,
                urgency,
                notes,
                fastingRequired,
                scheduledDate,
                scheduledTime,
                specialInstructions
            } = data;

            // Validate consultation exists
            const consultation = await Consultation.findById(consultationId);
            if (!consultation) {
                return { success: false, message: 'Consultation not found' };
            }

            // Validate laboratory exists and is active
            const laboratory = await Laboratory.findById(laboratoryId);
            if (!laboratory) {
                return { success: false, message: 'Laboratory not found' };
            }
            if (laboratory.status !== 'active') {
                return { success: false, message: 'Laboratory is not active' };
            }

            // Create lab order
            const labOrder = new LabOrder({
                consultationId,
                patientId,
                doctorId,
                laboratoryId,
                tests: tests.map(test => ({
                    ...test,
                    status: 'pending'
                })),
                clinicalIndication,
                urgency: urgency || 'routine',
                status: 'pending',
                notes,
                fastingRequired,
                scheduledDate,
                scheduledTime,
                specialInstructions
            });

            // Calculate estimated completion
            if (tests && tests.length > 0) {
                const maxTurnaround = Math.max(...tests.map(t => t.expectedTurnaround || 24));
                labOrder.estimatedCompletionDate = new Date(Date.now() + maxTurnaround * 60 * 60 * 1000);
            }

            await labOrder.save();

            Logger.info('Lab order created', { labOrderId: labOrder._id, orderNumber: labOrder.orderNumber });
            return {
                success: true,
                message: 'Lab order created successfully',
                data: labOrder
            };
        } catch (error) {
            Logger.error('Error creating lab order', error);
            throw error;
        }
    }

    // ========================================
    // READ
    // ========================================
    static async getLabOrderById(labOrderId, populateDetails = true) {
        try {
            let query = LabOrder.findById(labOrderId);

            if (populateDetails) {
                query = query
                    .populate('patientId', 'fname lname email phone dateOfBirth gender')
                    .populate('doctorId', 'fname lname email specialization phone')
                    .populate('laboratoryId', 'name address phone email workingHours accreditation')
                    .populate('consultationId', 'chiefComplaint diagnosis treatmentPlan')
                    .populate('sampleCollectedBy', 'fname lname')
                    .populate('reportApprovedBy', 'fname lname')
                    .populate('tests.performedBy', 'fname lname');
            }

            const labOrder = await query;

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            return { success: true, data: labOrder };
        } catch (error) {
            Logger.error('Error getting lab order', error);
            throw error;
        }
    }

    static async getLabOrderByOrderNumber(orderNumber) {
        try {
            const labOrder = await LabOrder.findByOrderNumber(orderNumber);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            return { success: true, data: labOrder };
        } catch (error) {
            Logger.error('Error getting lab order by order number', error);
            throw error;
        }
    }

    static async getAllLabOrders(filters = {}, page = 1, limit = 10) {
        try {
            const {
                patientId,
                doctorId,
                laboratoryId,
                status,
                urgency,
                startDate,
                endDate
            } = filters;

            const query = {};

            if (patientId) query.patientId = patientId;
            if (doctorId) query.doctorId = doctorId;
            if (laboratoryId) query.laboratoryId = laboratoryId;
            if (status) query.status = status;
            if (urgency) query.urgency = urgency;

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const skip = (page - 1) * limit;
            const [orders, total] = await Promise.all([
                LabOrder.find(query)
                    .populate('patientId', 'fname lname dateOfBirth')
                    .populate('doctorId', 'fname lname specialization')
                    .populate('laboratoryId', 'name address phone')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                LabOrder.countDocuments(query)
            ]);

            return {
                success: true,
                data: {
                    orders,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalOrders: total,
                        limit
                    }
                }
            };
        } catch (error) {
            Logger.error('Error getting lab orders', error);
            throw error;
        }
    }

    static async getLabOrdersByPatient(patientId, filters = {}) {
        try {
            const orders = await LabOrder.findByPatient(patientId, filters);

            return {
                success: true,
                data: orders
            };
        } catch (error) {
            Logger.error('Error getting lab orders by patient', error);
            throw error;
        }
    }

    static async getLabOrdersByDoctor(doctorId, filters = {}) {
        try {
            const orders = await LabOrder.findByDoctor(doctorId, filters);

            return {
                success: true,
                data: orders
            };
        } catch (error) {
            Logger.error('Error getting lab orders by doctor', error);
            throw error;
        }
    }

    static async getLabOrdersByLaboratory(laboratoryId, filters = {}) {
        try {
            const orders = await LabOrder.findByLaboratory(laboratoryId, filters);

            return {
                success: true,
                data: orders
            };
        } catch (error) {
            Logger.error('Error getting lab orders by laboratory', error);
            throw error;
        }
    }

    // ========================================
    // UPDATE
    // ========================================
    static async addTestToOrder(labOrderId, testData) {
        try {
            const labOrder = await LabOrder.findById(labOrderId);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            if (!labOrder.canBeCancelled) {
                return { success: false, message: 'Cannot add tests to order with current status' };
            }

            await labOrder.addTest(testData);

            Logger.info('Test added to lab order', { labOrderId, testName: testData.name });
            return {
                success: true,
                message: 'Test added successfully',
                data: labOrder
            };
        } catch (error) {
            Logger.error('Error adding test to lab order', error);
            throw error;
        }
    }

    static async updateLabOrderStatus(labOrderId, status, userId, reason = '') {
        try {
            const labOrder = await LabOrder.findById(labOrderId);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            const oldStatus = labOrder.status;
            labOrder.status = status;
            labOrder.addStatusHistory(status, userId, reason);

            // Update timestamps based on status
            if (status === 'sample_collected') {
                labOrder.sampleCollectedAt = new Date();
                labOrder.sampleCollectedBy = userId;
            } else if (status === 'in_progress') {
                labOrder.receivedByLab = new Date();
            } else if (status === 'completed') {
                labOrder.actualCompletionDate = new Date();
            }

            await labOrder.save();

            Logger.info('Lab order status updated', { labOrderId, oldStatus, newStatus: status });
            return {
                success: true,
                message: 'Lab order status updated successfully',
                data: labOrder
            };
        } catch (error) {
            Logger.error('Error updating lab order status', error);
            throw error;
        }
    }

    static async updateTestStatus(labOrderId, testId, status, resultData = {}, userId) {
        try {
            const labOrder = await LabOrder.findById(labOrderId);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            const test = labOrder.tests.id(testId);
            if (!test) {
                return { success: false, message: 'Test not found in this order' };
            }

            test.status = status;

            if (status === 'in_progress') {
                test.performedBy = userId;
                test.performedAt = new Date();
            } else if (status === 'completed') {
                test.completedAt = new Date();
                if (resultData.results) test.results = resultData.results;
                if (resultData.interpretation) test.interpretation = resultData.interpretation;
                if (resultData.criticalValues) test.criticalValues = resultData.criticalValues;
                if (resultData.resultNotes) test.resultNotes = resultData.resultNotes;
            }

            await labOrder.save();

            Logger.info('Test status updated', { labOrderId, testId, status });
            return {
                success: true,
                message: 'Test status updated successfully',
                data: labOrder
            };
        } catch (error) {
            Logger.error('Error updating test status', error);
            throw error;
        }
    }

    static async addTestResults(labOrderId, testId, resultsData, userId) {
        try {
            const labOrder = await LabOrder.findById(labOrderId);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            const test = labOrder.tests.id(testId);
            if (!test) {
                return { success: false, message: 'Test not found in this order' };
            }

            test.results = resultsData.results;
            test.interpretation = resultsData.interpretation;
            test.resultNotes = resultsData.notes;
            test.criticalValues = resultsData.criticalValues || [];
            test.status = 'completed';
            test.completedAt = new Date();
            test.performedBy = userId;

            await labOrder.save();

            Logger.info('Test results added', { labOrderId, testId });
            return {
                success: true,
                message: 'Test results added successfully',
                data: labOrder
            };
        } catch (error) {
            Logger.error('Error adding test results', error);
            throw error;
        }
    }

    // ========================================
    // DELETE / CANCEL
    // ========================================
    static async cancelLabOrder(labOrderId, reason, userId) {
        try {
            const labOrder = await LabOrder.findById(labOrderId);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            if (!labOrder.canBeCancelled) {
                return {
                    success: false,
                    message: 'Cannot cancel order. Sample collection or testing has already begun.'
                };
            }

            await labOrder.cancel(reason, userId);

            Logger.info('Lab order cancelled', { labOrderId, reason });
            return {
                success: true,
                message: 'Lab order cancelled successfully',
                data: labOrder
            };
        } catch (error) {
            Logger.error('Error cancelling lab order', error);
            throw error;
        }
    }

    // ========================================
    // RESULTS & REPORTS
    // ========================================
    static async getLabResults(labOrderId) {
        try {
            const labOrder = await LabOrder.findById(labOrderId)
                .populate('patientId', 'fname lname dateOfBirth gender')
                .populate('doctorId', 'fname lname specialization')
                .populate('laboratoryId', 'name address phone email')
                .populate('tests.performedBy', 'fname lname')
                .populate('reportApprovedBy', 'fname lname');

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            const completedTests = labOrder.tests.filter(t => t.status === 'completed');
            const pendingTests = labOrder.tests.filter(t => ['pending', 'in_progress'].includes(t.status));

            const results = {
                orderId: labOrder._id,
                orderNumber: labOrder.orderNumber,
                patient: labOrder.patientId,
                doctor: labOrder.doctorId,
                laboratory: labOrder.laboratoryId,
                completedTests,
                pendingTests,
                overallStatus: labOrder.status,
                overallResults: labOrder.overallResults,
                reportUrl: labOrder.reportUrl,
                reportGeneratedAt: labOrder.reportGeneratedAt,
                generatedAt: new Date()
            };

            return {
                success: true,
                message: 'Lab results retrieved successfully',
                data: results
            };
        } catch (error) {
            Logger.error('Error getting lab results', error);
            throw error;
        }
    }

    // ========================================
    // STATISTICS
    // ========================================
    static async getLabOrderStatistics(filters = {}) {
        try {
            const { doctorId, laboratoryId, startDate, endDate } = filters;
            const query = {};

            if (doctorId) query.doctorId = doctorId;
            if (laboratoryId) query.laboratoryId = laboratoryId;
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const [
                total,
                pending,
                inProgress,
                completed,
                cancelled,
                urgent,
                hasCritical
            ] = await Promise.all([
                LabOrder.countDocuments(query),
                LabOrder.countDocuments({ ...query, status: 'pending' }),
                LabOrder.countDocuments({ ...query, status: 'in_progress' }),
                LabOrder.countDocuments({ ...query, status: 'completed' }),
                LabOrder.countDocuments({ ...query, status: 'cancelled' }),
                LabOrder.countDocuments({ ...query, urgency: { $in: ['urgent', 'stat'] } }),
                LabOrder.countDocuments({ ...query, hasCriticalResults: true })
            ]);

            return {
                success: true,
                data: {
                    total,
                    byStatus: {
                        pending,
                        inProgress,
                        completed,
                        cancelled
                    },
                    urgent,
                    hasCriticalResults: hasCritical
                }
            };
        } catch (error) {
            Logger.error('Error getting lab order statistics', error);
            throw error;
        }
    }
}

export default LabOrderService;
