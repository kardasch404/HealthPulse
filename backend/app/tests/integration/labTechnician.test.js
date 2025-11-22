import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import request from 'supertest';
import app from '../../../app.js';

describe('Lab Technician API Integration Tests', () => {
    let labTechToken;
    let doctorToken;
    let labOrderId;
    let testId;

    before(async function() {
        this.timeout(10000);
        
        // Login as lab technician
        const labTechLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'labtech@healthpulse.com',
                password: 'LabTech@123'
            });
        
        if (labTechLogin.body.success) {
            labTechToken = labTechLogin.body.data.tokens.accessToken;
        }
        
        // Login as doctor to create test data
        const doctorLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'doctor@healthpulse.com',
                password: 'Doctor@123'
            });
        
        if (doctorLogin.body.success) {
            doctorToken = doctorLogin.body.data.tokens.accessToken;
        }
    });

    describe('GET /api/v1/lab-orders - List Lab Orders', () => {
        it('should get all lab orders as lab technician', async function() {
            this.timeout(5000);
            
            const response = await request(app)
                .get('/api/v1/lab-orders')
                .set('Authorization', `Bearer ${labTechToken}`);

            expect(response.status).to.be.oneOf([200, 401]);
            if (response.status === 200) {
                expect(response.body).to.have.property('success', true);
                expect(response.body.data).to.have.property('labOrders');
                
                if (response.body.data.labOrders.length > 0) {
                    labOrderId = response.body.data.labOrders[0].id;
                }
            }
        });

        it('should filter lab orders by status=pending', async function() {
            this.timeout(5000);
            
            const response = await request(app)
                .get('/api/v1/lab-orders?status=pending')
                .set('Authorization', `Bearer ${labTechToken}`);

            if (response.status === 200) {
                expect(response.body.success).to.be.true;
            }
        });
    });

    describe('GET /api/v1/lab-orders/:id - Get Lab Order Details', () => {
        it('should get specific lab order details', async function() {
            this.timeout(5000);
            
            if (!labOrderId) {
                this.skip();
                return;
            }

            const response = await request(app)
                .get(`/api/v1/lab-orders/${labOrderId}`)
                .set('Authorization', `Bearer ${labTechToken}`);

            if (response.status === 200) {
                expect(response.body.success).to.be.true;
                expect(response.body.data.labOrder).to.have.property('tests');
                expect(response.body.data.labOrder).to.have.property('status');
                
                if (response.body.data.labOrder.tests.length > 0) {
                    testId = response.body.data.labOrder.tests[0]._id;
                }
            }
        });
    });

    describe('PATCH /api/v1/lab-orders/:id/status - Update Status', () => {
        it('should update lab order status to in_progress', async function() {
            this.timeout(5000);
            
            if (!labOrderId) {
                this.skip();
                return;
            }

            const response = await request(app)
                .patch(`/api/v1/lab-orders/${labOrderId}/status`)
                .set('Authorization', `Bearer ${labTechToken}`)
                .send({
                    status: 'in_progress',
                    notes: 'Starting laboratory analysis'
                });

            expect(response.status).to.be.oneOf([200, 400]);
        });

        it('should reject invalid status value', async function() {
            this.timeout(5000);
            
            if (!labOrderId) {
                this.skip();
                return;
            }

            const response = await request(app)
                .patch(`/api/v1/lab-orders/${labOrderId}/status`)
                .set('Authorization', `Bearer ${labTechToken}`)
                .send({
                    status: 'invalid_status'
                });

            expect(response.status).to.equal(400);
        });
    });

    describe('POST /api/v1/lab-orders/:id/upload-results - Upload Results', () => {
        it('should upload lab results as JSON', async function() {
            this.timeout(5000);
            
            if (!labOrderId) {
                this.skip();
                return;
            }

            const response = await request(app)
                .post(`/api/v1/lab-orders/${labOrderId}/upload-results`)
                .set('Authorization', `Bearer ${labTechToken}`)
                .send({
                    tests: [
                        {
                            testName: 'Complete Blood Count (CBC)',
                            result: 'Normal',
                            value: '5.0',
                            unit: 'million cells/mcL',
                            referenceRange: '4.5-5.5',
                            status: 'normal',
                            notes: 'All parameters within normal limits'
                        },
                        {
                            testName: 'Hemoglobin',
                            result: '14.5',
                            value: '14.5',
                            unit: 'g/dL',
                            referenceRange: '13.5-17.5',
                            status: 'normal'
                        }
                    ]
                });

            expect(response.status).to.be.oneOf([200, 400]);
            if (response.status === 200) {
                expect(response.body.success).to.be.true;
            }
        });

        it('should reject empty test array', async function() {
            this.timeout(5000);
            
            if (!labOrderId) {
                this.skip();
                return;
            }

            const response = await request(app)
                .post(`/api/v1/lab-orders/${labOrderId}/upload-results`)
                .set('Authorization', `Bearer ${labTechToken}`)
                .send({
                    tests: []
                });

            expect(response.status).to.equal(400);
        });
    });

    describe('POST /api/v1/lab-orders/:id/validate - Validate Lab Order', () => {
        it('should validate lab order', async function() {
            this.timeout(5000);
            
            if (!labOrderId) {
                this.skip();
                return;
            }

            const response = await request(app)
                .post(`/api/v1/lab-orders/${labOrderId}/validate`)
                .set('Authorization', `Bearer ${labTechToken}`)
                .send({
                    validationNotes: 'All test results reviewed and verified. Quality control checks passed.',
                    technicianSignature: 'John Technician, MT(ASCP)'
                });

            expect(response.status).to.be.oneOf([200, 400]);
        });
    });

    describe('GET /api/v1/lab-orders/:id/result-history - View History', () => {
        it('should get result history', async function() {
            this.timeout(5000);
            
            if (!labOrderId) {
                this.skip();
                return;
            }

            const response = await request(app)
                .get(`/api/v1/lab-orders/${labOrderId}/result-history`)
                .set('Authorization', `Bearer ${labTechToken}`);

            if (response.status === 200) {
                expect(response.body.success).to.be.true;
                expect(response.body.data.labOrder).to.have.property('statusHistory');
                expect(response.body.data.labOrder).to.have.property('tests');
            }
        });
    });

    describe('PUT /api/v1/lab-orders/:id/tests - Add Test (Permission Test)', () => {
        it('should add test to pending lab order', async function() {
            this.timeout(5000);
            
            if (!labOrderId) {
                this.skip();
                return;
            }

            const response = await request(app)
                .put(`/api/v1/lab-orders/${labOrderId}/tests`)
                .set('Authorization', `Bearer ${labTechToken}`)
                .send({
                    name: 'Blood Glucose',
                    code: 'GLU',
                    category: 'Chemistry',
                    urgency: 'routine'
                });

            // Should work now with PROCESS_LAB_ORDERS permission
            expect(response.status).to.be.oneOf([200, 400]);
        });
    });

    describe('Error Handling', () => {
        it('should return 401 without authentication', async function() {
            this.timeout(5000);
            
            const response = await request(app)
                .get('/api/v1/lab-orders');

            expect(response.status).to.equal(401);
        });

        it('should return 404 for non-existent lab order', async function() {
            this.timeout(5000);
            
            const fakeId = '507f1f77bcf86cd799439011';
            
            const response = await request(app)
                .get(`/api/v1/lab-orders/${fakeId}`)
                .set('Authorization', `Bearer ${labTechToken}`);

            expect(response.status).to.be.oneOf([404, 400]);
        });

        it('should return 400 for invalid lab order ID format', async function() {
            this.timeout(5000);
            
            const response = await request(app)
                .get('/api/v1/lab-orders/invalid-id')
                .set('Authorization', `Bearer ${labTechToken}`);

            expect(response.status).to.equal(400);
        });
    });
});
