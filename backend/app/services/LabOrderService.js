import LabOrder from '../models/LabOrder.js';
import Consultation from '../models/Consultation.js';
import Laboratory from '../models/Laboratory.js';
import User from '../models/User.js';
import Logger from '../logs/Logger.js';

class LabOrderService {
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

            const consultation = await Consultation.findById(consultationId);
            if (!consultation) {
                return { success: false, message: 'Consultation not found' };
            }

            const laboratory = await Laboratory.findById(laboratoryId);
            if (!laboratory) {
                return { success: false, message: 'Laboratory not found' };
            }
            if (laboratory.status !== 'active') {
                return { success: false, message: 'Laboratory is not active' };
            }

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
                    .populate('tests.performedBy', 'fname lname')
                    .populate('uploadedReports.uploadedBy', 'fname lname')
                    .populate('uploadedResults.uploadedBy', 'fname lname');
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
                    .populate('uploadedReports.uploadedBy', 'fname lname')
                    .populate('uploadedResults.uploadedBy', 'fname lname')
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

    static async getCompletedOrdersByLaboratory(laboratoryId) {
        try {
            const orders = await LabOrder.find({
                laboratoryId,
                status: 'completed'
            })
                .populate('patientId', 'fname lname')
                .populate('doctorId', 'fname lname')
                .sort({ actualCompletionDate: -1 })
                .limit(50);

            return {
                success: true,
                data: orders
            };
        } catch (error) {
            Logger.error('Error getting completed orders by laboratory', error);
            throw error;
        }
    }

    static async uploadLabResultsJSON(labOrderId, resultsData, userId) {
        try {
            const labOrder = await LabOrder.findById(labOrderId);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            for (const testResult of resultsData.tests || []) {
                const test = labOrder.tests.id(testResult.testId);
                if (test) {
                    test.results = testResult.results;
                    test.interpretation = testResult.interpretation;
                    test.criticalValues = testResult.criticalValues || [];
                    test.resultNotes = testResult.resultNotes;
                    test.status = 'completed';
                    test.completedAt = new Date();
                    test.performedBy = userId;
                }
            }

            if (resultsData.overallResults) {
                labOrder.overallResults = resultsData.overallResults;
            }

            // Store JSON results info
            if (!labOrder.uploadedResults) {
                labOrder.uploadedResults = [];
            }
            
            labOrder.uploadedResults.push({
                type: 'json',
                data: resultsData,
                uploadedAt: new Date(),
                uploadedBy: userId
            });

            await labOrder.save();

            Logger.info('Lab results JSON uploaded', { labOrderId });
            return {
                success: true,
                message: 'Lab results uploaded successfully',
                data: labOrder
            };
        } catch (error) {
            Logger.error('Error uploading lab results JSON', error);
            throw error;
        }
    }

    static async uploadLabReportPDF(labOrderId, file, metadata, userId) {
        try {
            const labOrder = await LabOrder.findById(labOrderId);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            const DocumentService = (await import('./DocumentService.js')).default;
            
            const documentMetadata = {
                patientId: labOrder.patientId,
                documentType: 'lab_report',
                title: metadata.title || `Lab Report - ${labOrder.orderNumber}`,
                description: metadata.description || `Lab report for order ${labOrder.orderNumber}`,
                labOrderId: labOrderId,
                category: 'laboratory'
            };

            const uploadResult = await DocumentService.uploadDocument(
                file,
                documentMetadata,
                userId
            );

            if (!uploadResult.success) {
                // Handle storage-specific errors
                if (uploadResult.message && uploadResult.message.includes('minimum free drive threshold')) {
                    return {
                        success: false,
                        message: 'Storage is full. Please contact system administrator to free up space.',
                        error: 'STORAGE_FULL'
                    };
                }
                return uploadResult;
            }

            // Store report info in lab order
            if (!labOrder.uploadedReports) {
                labOrder.uploadedReports = [];
            }
            
            labOrder.uploadedReports.push({
                documentId: uploadResult.data._id,
                fileName: file.originalname,
                fileUrl: uploadResult.data.fileUrl,
                uploadedAt: new Date(),
                uploadedBy: userId,
                fileSize: file.size,
                mimeType: file.mimetype
            });
            
            labOrder.reportUrl = uploadResult.data.fileUrl;
            labOrder.reportGeneratedAt = new Date();
            await labOrder.save();

            Logger.info('Lab report PDF uploaded', { labOrderId });
            return {
                success: true,
                message: 'Lab report uploaded successfully',
                data: {
                    ...uploadResult.data,
                    labOrder: labOrder
                }
            };
        } catch (error) {
            Logger.error('Error uploading lab report PDF', error);
            if (error.message && error.message.includes('minimum free drive threshold')) {
                return {
                    success: false,
                    message: 'Storage is full. Please contact system administrator to free up space.',
                    error: 'STORAGE_FULL'
                };
            }
            throw error;
        }
    }

    static async validateLabOrder(labOrderId, userId, validationNotes) {
        try {
            const labOrder = await LabOrder.findById(labOrderId);

            if (!labOrder) {
                return { success: false, message: 'Lab order not found' };
            }

            labOrder.status = 'completed';
            labOrder.actualCompletionDate = new Date();
            labOrder.reportApprovedBy = userId;
            labOrder.reportApprovedAt = new Date();
            
            labOrder.addStatusHistory(
                'completed',
                userId,
                `Validated by technician: ${validationNotes || 'No notes'}`
            );

            await labOrder.save();

            Logger.info('Lab order validated', { labOrderId, userId });
            return {
                success: true,
                message: 'Lab order validated successfully',
                data: labOrder
            };
        } catch (error) {
            Logger.error('Error validating lab order', error);
            throw error;
        }
    }
}

export default LabOrderService;
