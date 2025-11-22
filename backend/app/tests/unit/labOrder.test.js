import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import LabOrderService from '../../services/LabOrderService.js';
import LabOrder from '../../models/LabOrder.js';

describe('Lab Order Service Tests', () => {
    let testLabOrderId;
    let testDoctorId;
    let testPatientId;
    let testLaboratoryId;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27018/healthpulse_test');
        
        // Create test IDs
        testDoctorId = new mongoose.Types.ObjectId();
        testPatientId = new mongoose.Types.ObjectId();
        testLaboratoryId = new mongoose.Types.ObjectId();
    });

    afterAll(async () => {
        // Clean up test data
        await LabOrder.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear lab orders before each test
        await LabOrder.deleteMany({});
    });

    describe('Create Lab Order', () => {
        it('should create a lab order with valid data', async () => {
            const labOrderData = {
                consultationId: new mongoose.Types.ObjectId(),
                patientId: testPatientId,
                doctorId: testDoctorId,
                laboratoryId: testLaboratoryId,
                tests: [
                    {
                        name: 'Complete Blood Count',
                        code: 'CBC',
                        category: 'Hematology',
                        urgency: 'routine'
                    }
                ],
                clinicalIndication: 'Routine checkup',
                urgency: 'routine',
                fastingRequired: false
            };

            const result = await LabOrderService.createLabOrder(labOrderData);

            expect(result.success).toBe(true);
            expect(result.data).toHaveProperty('id');
            expect(result.data.tests).toHaveLength(1);
            expect(result.data.tests[0].name).toBe('Complete Blood Count');
            
            testLabOrderId = result.data.id;
        });

        it('should fail without required fields', async () => {
            const incompleteData = {
                patientId: testPatientId
            };

            await expect(LabOrderService.createLabOrder(incompleteData)).rejects.toThrow();
        });

        it('should create lab order with multiple tests', async () => {
            const labOrderData = {
                consultationId: new mongoose.Types.ObjectId(),
                patientId: testPatientId,
                doctorId: testDoctorId,
                laboratoryId: testLaboratoryId,
                tests: [
                    {
                        name: 'Complete Blood Count',
                        code: 'CBC',
                        category: 'Hematology',
                        urgency: 'routine'
                    },
                    {
                        name: 'Blood Glucose',
                        code: 'GLU',
                        category: 'Chemistry',
                        urgency: 'routine'
                    }
                ],
                clinicalIndication: 'Check blood parameters',
                urgency: 'routine'
            };

            const result = await LabOrderService.createLabOrder(labOrderData);

            expect(result.success).toBe(true);
            expect(result.data.tests).toHaveLength(2);
        });
    });

    describe('Add Test to Lab Order', () => {
        beforeEach(async () => {
            // Create a lab order for testing
            const labOrderData = {
                consultationId: new mongoose.Types.ObjectId(),
                patientId: testPatientId,
                doctorId: testDoctorId,
                laboratoryId: testLaboratoryId,
                tests: [
                    {
                        name: 'Complete Blood Count',
                        code: 'CBC',
                        category: 'Hematology',
                        urgency: 'routine'
                    }
                ],
                clinicalIndication: 'Routine checkup',
                urgency: 'routine'
            };

            const result = await LabOrderService.createLabOrder(labOrderData);
            testLabOrderId = result.data.id;
        });

        it('should add a new test to pending lab order', async () => {
            const newTest = {
                name: 'Hemoglobin A1c',
                code: 'HBA1C',
                category: 'Endocrinology',
                urgency: 'routine'
            };

            const result = await LabOrderService.addTestToOrder(testLabOrderId, newTest);

            expect(result.success).toBe(true);
            expect(result.data.tests).toHaveLength(2);
            expect(result.data.tests[1].name).toBe('Hemoglobin A1c');
        });

        it('should not add test to completed lab order', async () => {
            // Update lab order status to completed
            const labOrder = await LabOrder.findById(testLabOrderId);
            labOrder.status = 'completed';
            await labOrder.save();

            const newTest = {
                name: 'Blood Glucose',
                code: 'GLU',
                category: 'Chemistry',
                urgency: 'routine'
            };

            const result = await LabOrderService.addTestToOrder(testLabOrderId, newTest);

            expect(result.success).toBe(false);
            expect(result.message).toContain('Cannot add tests');
        });
    });

    describe('Update Lab Order Status', () => {
        beforeEach(async () => {
            const labOrderData = {
                consultationId: new mongoose.Types.ObjectId(),
                patientId: testPatientId,
                doctorId: testDoctorId,
                laboratoryId: testLaboratoryId,
                tests: [
                    {
                        name: 'Complete Blood Count',
                        code: 'CBC',
                        category: 'Hematology',
                        urgency: 'routine'
                    }
                ],
                clinicalIndication: 'Routine checkup',
                urgency: 'routine'
            };

            const result = await LabOrderService.createLabOrder(labOrderData);
            testLabOrderId = result.data.id;
        });

        it('should update lab order status to in_progress', async () => {
            const result = await LabOrderService.updateLabOrderStatus(
                testLabOrderId,
                'in_progress',
                testDoctorId,
                'Starting lab tests'
            );

            expect(result.success).toBe(true);
            expect(result.data.status).toBe('in_progress');
        });

        it('should update lab order status to completed', async () => {
            const result = await LabOrderService.updateLabOrderStatus(
                testLabOrderId,
                'completed',
                testDoctorId,
                'All tests completed'
            );

            expect(result.success).toBe(true);
            expect(result.data.status).toBe('completed');
        });

        it('should track status history', async () => {
            await LabOrderService.updateLabOrderStatus(
                testLabOrderId,
                'in_progress',
                testDoctorId,
                'Starting tests'
            );

            const result = await LabOrderService.updateLabOrderStatus(
                testLabOrderId,
                'completed',
                testDoctorId,
                'Tests completed'
            );

            expect(result.data.statusHistory).toHaveLength(3); // Created, in_progress, completed
        });
    });

    describe('Get Lab Orders', () => {
        beforeEach(async () => {
            // Create multiple lab orders
            await LabOrderService.createLabOrder({
                consultationId: new mongoose.Types.ObjectId(),
                patientId: testPatientId,
                doctorId: testDoctorId,
                laboratoryId: testLaboratoryId,
                tests: [
                    {
                        name: 'Complete Blood Count',
                        code: 'CBC',
                        category: 'Hematology',
                        urgency: 'routine'
                    }
                ],
                clinicalIndication: 'Routine checkup',
                urgency: 'routine'
            });

            await LabOrderService.createLabOrder({
                consultationId: new mongoose.Types.ObjectId(),
                patientId: testPatientId,
                doctorId: testDoctorId,
                laboratoryId: testLaboratoryId,
                tests: [
                    {
                        name: 'Blood Glucose',
                        code: 'GLU',
                        category: 'Chemistry',
                        urgency: 'urgent'
                    }
                ],
                clinicalIndication: 'Check glucose levels',
                urgency: 'urgent'
            });
        });

        it('should get all lab orders', async () => {
            const result = await LabOrderService.getAllLabOrders({});

            expect(result.success).toBe(true);
            expect(result.data.labOrders.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter lab orders by status', async () => {
            const result = await LabOrderService.getAllLabOrders({ status: 'pending' });

            expect(result.success).toBe(true);
            expect(result.data.labOrders.every(order => order.status === 'pending')).toBe(true);
        });

        it('should filter lab orders by urgency', async () => {
            const result = await LabOrderService.getAllLabOrders({ urgency: 'urgent' });

            expect(result.success).toBe(true);
            expect(result.data.labOrders.every(order => order.urgency === 'urgent')).toBe(true);
        });
    });

    describe('Cancel Lab Order', () => {
        beforeEach(async () => {
            const labOrderData = {
                consultationId: new mongoose.Types.ObjectId(),
                patientId: testPatientId,
                doctorId: testDoctorId,
                laboratoryId: testLaboratoryId,
                tests: [
                    {
                        name: 'Complete Blood Count',
                        code: 'CBC',
                        category: 'Hematology',
                        urgency: 'routine'
                    }
                ],
                clinicalIndication: 'Routine checkup',
                urgency: 'routine'
            };

            const result = await LabOrderService.createLabOrder(labOrderData);
            testLabOrderId = result.data.id;
        });

        it('should cancel a pending lab order', async () => {
            const result = await LabOrderService.cancelLabOrder(
                testLabOrderId,
                testDoctorId,
                'Patient request'
            );

            expect(result.success).toBe(true);
            expect(result.data.status).toBe('cancelled');
        });

        it('should not cancel a completed lab order', async () => {
            // Update to completed
            await LabOrderService.updateLabOrderStatus(
                testLabOrderId,
                'completed',
                testDoctorId,
                'Tests done'
            );

            const result = await LabOrderService.cancelLabOrder(
                testLabOrderId,
                testDoctorId,
                'Changed mind'
            );

            expect(result.success).toBe(false);
        });
    });
});
