import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import DocumentService from '../../services/DocumentService.js';
import MedicalDocument from '../../models/MedicalDocument.js';

describe('Medical Document Service Tests', () => {
    let testDocumentId;
    let testPatientId;
    let testUploaderId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27018/healthpulse_test');
        
        testPatientId = new mongoose.Types.ObjectId();
        testUploaderId = new mongoose.Types.ObjectId();
    });

    afterAll(async () => {
        await MedicalDocument.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await MedicalDocument.deleteMany({});
    });

    describe('Upload Document', () => {
        it('should upload a document with valid data', async () => {
            const fileData = {
                buffer: Buffer.from('Test PDF content'),
                originalname: 'test-report.pdf',
                mimetype: 'application/pdf',
                size: 1024
            };

            const metadata = {
                title: 'Blood Test Report',
                description: 'Complete blood count results',
                documentType: 'lab_report',
                category: 'laboratory',
                patientId: testPatientId.toString(),
                tags: ['blood', 'test', 'CBC']
            };

            const result = await DocumentService.uploadDocument(fileData, metadata, testUploaderId);

            expect(result.success).toBe(true);
            expect(result.data.document).toHaveProperty('id');
            expect(result.data.document.title).toBe('Blood Test Report');
            expect(result.data.document.documentType).toBe('lab_report');
            
            testDocumentId = result.data.document.id;
        });

        it('should validate file size limit', async () => {
            const largeFile = {
                buffer: Buffer.alloc(11 * 1024 * 1024), // 11MB
                originalname: 'large-file.pdf',
                mimetype: 'application/pdf',
                size: 11 * 1024 * 1024
            };

            const metadata = {
                title: 'Large Document',
                documentType: 'lab_report',
                category: 'laboratory',
                patientId: testPatientId.toString()
            };

            await expect(
                DocumentService.uploadDocument(largeFile, metadata, testUploaderId)
            ).rejects.toThrow();
        });

        it('should create document with all metadata', async () => {
            const fileData = {
                buffer: Buffer.from('Test content'),
                originalname: 'consultation.pdf',
                mimetype: 'application/pdf',
                size: 512
            };

            const metadata = {
                title: 'Consultation Notes',
                description: 'Patient consultation summary',
                documentType: 'consultation_note',
                category: 'clinical',
                patientId: testPatientId.toString(),
                consultationId: new mongoose.Types.ObjectId().toString(),
                tags: ['consultation', 'notes'],
                confidentialityLevel: 'confidential'
            };

            const result = await DocumentService.uploadDocument(fileData, metadata, testUploaderId);

            expect(result.success).toBe(true);
            expect(result.data.document.confidentialityLevel).toBe('confidential');
            expect(result.data.document.tags).toContain('consultation');
        });
    });

    describe('Get Document', () => {
        beforeEach(async () => {
            const fileData = {
                buffer: Buffer.from('Test content'),
                originalname: 'test.pdf',
                mimetype: 'application/pdf',
                size: 512
            };

            const metadata = {
                title: 'Test Document',
                documentType: 'lab_report',
                category: 'laboratory',
                patientId: testPatientId.toString()
            };

            const result = await DocumentService.uploadDocument(fileData, metadata, testUploaderId);
            testDocumentId = result.data.document.id;
        });

        it('should get document by id', async () => {
            const result = await DocumentService.getDocumentById(testDocumentId, testUploaderId);

            expect(result.success).toBe(true);
            expect(result.data.document.id).toBe(testDocumentId);
            expect(result.data.document.title).toBe('Test Document');
        });

        it('should record view in audit trail', async () => {
            await DocumentService.getDocumentById(testDocumentId, testUploaderId);
            await DocumentService.getDocumentById(testDocumentId, testUploaderId);

            const result = await DocumentService.getDocumentById(testDocumentId, testUploaderId);

            expect(result.data.document.viewHistory).toHaveLength(3);
        });

        it('should return error for non-existent document', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const result = await DocumentService.getDocumentById(fakeId, testUploaderId);

            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });
    });

    describe('List Patient Documents', () => {
        beforeEach(async () => {
            // Create multiple documents
            for (let i = 0; i < 3; i++) {
                const fileData = {
                    buffer: Buffer.from(`Test content ${i}`),
                    originalname: `test-${i}.pdf`,
                    mimetype: 'application/pdf',
                    size: 512
                };

                const metadata = {
                    title: `Test Document ${i}`,
                    documentType: i === 0 ? 'lab_report' : 'consultation_note',
                    category: i === 0 ? 'laboratory' : 'clinical',
                    patientId: testPatientId.toString()
                };

                await DocumentService.uploadDocument(fileData, metadata, testUploaderId);
            }
        });

        it('should list all patient documents', async () => {
            const result = await DocumentService.listPatientDocuments(testPatientId, {});

            expect(result.success).toBe(true);
            expect(result.data.documents.length).toBeGreaterThanOrEqual(3);
        });

        it('should filter documents by type', async () => {
            const result = await DocumentService.listPatientDocuments(testPatientId, {
                documentType: 'lab_report'
            });

            expect(result.success).toBe(true);
            expect(result.data.documents.every(doc => doc.documentType === 'lab_report')).toBe(true);
        });

        it('should filter documents by category', async () => {
            const result = await DocumentService.listPatientDocuments(testPatientId, {
                category: 'laboratory'
            });

            expect(result.success).toBe(true);
            expect(result.data.documents.every(doc => doc.category === 'laboratory')).toBe(true);
        });

        it('should paginate results', async () => {
            const result = await DocumentService.listPatientDocuments(testPatientId, {
                page: 1,
                limit: 2
            });

            expect(result.success).toBe(true);
            expect(result.data.documents.length).toBeLessThanOrEqual(2);
            expect(result.data.pagination).toHaveProperty('total');
        });
    });

    describe('Update Document', () => {
        beforeEach(async () => {
            const fileData = {
                buffer: Buffer.from('Test content'),
                originalname: 'test.pdf',
                mimetype: 'application/pdf',
                size: 512
            };

            const metadata = {
                title: 'Original Title',
                description: 'Original description',
                documentType: 'lab_report',
                category: 'laboratory',
                patientId: testPatientId.toString()
            };

            const result = await DocumentService.uploadDocument(fileData, metadata, testUploaderId);
            testDocumentId = result.data.document.id;
        });

        it('should update document metadata', async () => {
            const updates = {
                title: 'Updated Title',
                description: 'Updated description',
                tags: ['updated', 'test']
            };

            const result = await DocumentService.updateDocument(testDocumentId, updates, testUploaderId);

            expect(result.success).toBe(true);
            expect(result.data.document.title).toBe('Updated Title');
            expect(result.data.document.description).toBe('Updated description');
        });

        it('should not update file content', async () => {
            const updates = {
                fileName: 'hacked.pdf'
            };

            const result = await DocumentService.updateDocument(testDocumentId, updates, testUploaderId);

            expect(result.data.document.fileName).not.toBe('hacked.pdf');
        });
    });

    describe('Delete Document', () => {
        beforeEach(async () => {
            const fileData = {
                buffer: Buffer.from('Test content'),
                originalname: 'test.pdf',
                mimetype: 'application/pdf',
                size: 512
            };

            const metadata = {
                title: 'Test Document',
                documentType: 'lab_report',
                category: 'laboratory',
                patientId: testPatientId.toString()
            };

            const result = await DocumentService.uploadDocument(fileData, metadata, testUploaderId);
            testDocumentId = result.data.document.id;
        });

        it('should soft delete document', async () => {
            const result = await DocumentService.deleteDocument(
                testDocumentId,
                testUploaderId,
                'No longer needed'
            );

            expect(result.success).toBe(true);

            const doc = await MedicalDocument.findById(testDocumentId);
            expect(doc.status).toBe('deleted');
            expect(doc.deletedBy).toBeDefined();
        });

        it('should require deletion reason', async () => {
            await expect(
                DocumentService.deleteDocument(testDocumentId, testUploaderId)
            ).rejects.toThrow();
        });
    });

    describe('Download Document', () => {
        beforeEach(async () => {
            const fileData = {
                buffer: Buffer.from('Test PDF content'),
                originalname: 'test.pdf',
                mimetype: 'application/pdf',
                size: 512
            };

            const metadata = {
                title: 'Test Document',
                documentType: 'lab_report',
                category: 'laboratory',
                patientId: testPatientId.toString()
            };

            const result = await DocumentService.uploadDocument(fileData, metadata, testUploaderId);
            testDocumentId = result.data.document.id;
        });

        it('should record download in audit trail', async () => {
            await DocumentService.downloadDocument(testDocumentId, testUploaderId);

            const result = await DocumentService.getDocumentById(testDocumentId, testUploaderId);

            expect(result.data.document.downloadHistory.length).toBeGreaterThan(0);
        });
    });
});
