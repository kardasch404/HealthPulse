# 📄 Doctor Medical Documents - Complete Postman Testing Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Authentication Setup](#authentication-setup)
- [Document Management](#document-management)
- [Advanced Operations](#advanced-operations)
- [Test Scripts](#test-scripts)

---

## Prerequisites

### ⚠️ IMPORTANT: First Time Setup
**Before testing, you MUST run this command to update role permissions:**
```bash
node scripts/update-role-permissions.js
```

This updates the database with the new document management permissions. Without this, you'll get "permission denied" errors.

### Required Information
- **Base URL**: `http://localhost:3000/api/v1`
- **Doctor Credentials**: Email and password with `doctor` role
- **Patient IDs**: Valid patient IDs from the system
- **Document Files**: Sample PDF, images, or documents to upload

### Environment Variables Setup in Postman
```javascript
baseUrl: http://localhost:3000/api/v1
doctorToken: (will be set after login)
patientId: (patient ID for documents)
documentId: (will be set after upload)
consultationId: (optional)
```

---

## Authentication Setup

### 1. Login as Doctor

**Request:**
```
POST {{baseUrl}}/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "doctor@hospital.com",
  "password": "YourPassword123!"
}
```

**Test Script:**
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('accessToken');
    
    // Save token to environment
    pm.environment.set("doctorToken", jsonData.data.accessToken);
    console.log("✅ Doctor token saved");
});

pm.test("User has doctor role", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.user.role).to.equal('doctor');
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "doctor@hospital.com",
      "role": "doctor",
      "firstName": "Dr. Sarah",
      "lastName": "Johnson"
    }
  }
}
```

---

## Document Management

### 2. Upload Patient Document

**Request:**
```
POST {{baseUrl}}/documents
```

**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Body (form-data):**
```
file: [Select file from computer - PDF, JPG, PNG, DOC, etc.]
patientId: 507f1f77bcf86cd799439013
documentType: consultation_note
title: Follow-up Consultation Notes
description: Patient follow-up after surgery - recovery assessment
category: clinical
consultationId: 507f1f77bcf86cd799439020
tags: ["post-surgery", "follow-up", "recovery"]
confidentialityLevel: standard
```

**⚠️ Important for Postman:**
1. Select **Body** tab
2. Choose **form-data** (NOT raw)
3. Add key `file` with type **File**
4. Click "Select Files" and choose your document
5. Add other keys as **Text** type
6. For `tags`, use JSON array format: `["tag1", "tag2"]`

**Supported Document Types:**
- `lab_report` - Laboratory test reports
- `prescription` - Prescription documents
- `consultation_note` - Clinical consultation notes
- `imaging_scan` - X-rays, CT scans, MRI reports
- `discharge_summary` - Hospital discharge summaries
- `referral_letter` - Referral documents
- `consent_form` - Patient consent forms
- `medical_certificate` - Medical certificates
- `other` - Other medical documents

**Supported File Formats:**
- PDF (`.pdf`)
- Images: JPEG (`.jpg`, `.jpeg`), PNG (`.png`)
- Documents: Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`)
- Text (`.txt`)
- JSON (`.json`)

**Test Script:**
```javascript
pm.test("Document uploaded successfully", function () {
    pm.response.to.have.status(201);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("uploaded successfully");
});

pm.test("Document has correct metadata", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('_id');
    pm.expect(jsonData.data).to.have.property('fileName');
    pm.expect(jsonData.data).to.have.property('minioPath');
    pm.expect(jsonData.data.documentType).to.equal('consultation_note');
    pm.expect(jsonData.data.patientId).to.be.a('string');
    
    // Save document ID for later operations
    pm.environment.set("documentId", jsonData.data._id);
    console.log("✅ Document ID saved:", jsonData.data._id);
});

pm.test("File stored in MinIO", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.minioPath).to.include('medical-documents/');
    pm.expect(jsonData.data.fileSize).to.be.above(0);
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439025",
    "patientId": "507f1f77bcf86cd799439013",
    "documentType": "consultation_note",
    "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "originalFileName": "Follow_up_notes.pdf",
    "fileSize": 524288,
    "mimeType": "application/pdf",
    "minioPath": "medical-documents/507f1f77bcf86cd799439013/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "title": "Follow-up Consultation Notes",
    "description": "Patient follow-up after surgery - recovery assessment",
    "category": "clinical",
    "consultationId": "507f1f77bcf86cd799439020",
    "tags": ["post-surgery", "follow-up", "recovery"],
    "uploadedBy": "507f1f77bcf86cd799439011",
    "uploadDate": "2024-01-15T14:30:00.000Z",
    "confidentialityLevel": "standard",
    "status": "active",
    "version": 1
  }
}
```

---

### 3. List Patient Documents

**Request:**
```
GET {{baseUrl}}/documents/patient/{{patientId}}
```

**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Query Parameters (all optional):**
- `documentType`: Filter by type (e.g., `lab_report`)
- `category`: Filter by category (e.g., `clinical`)
- `fromDate`: Start date (ISO format: `2024-01-01`)
- `toDate`: End date (ISO format: `2024-12-31`)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Example with filters:**
```
GET {{baseUrl}}/documents/patient/{{patientId}}?documentType=consultation_note&category=clinical&limit=20
```

**Test Script:**
```javascript
pm.test("Documents retrieved successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.documents).to.be.an('array');
});

pm.test("Pagination info present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('total');
    pm.expect(jsonData.data).to.have.property('page');
    pm.expect(jsonData.data).to.have.property('pages');
    pm.expect(jsonData.data).to.have.property('limit');
});

pm.test("Documents have required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.data.documents.length > 0) {
        var doc = jsonData.data.documents[0];
        pm.expect(doc).to.have.property('_id');
        pm.expect(doc).to.have.property('documentType');
        pm.expect(doc).to.have.property('title');
        pm.expect(doc).to.have.property('uploadDate');
    }
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439025",
        "patientId": "507f1f77bcf86cd799439013",
        "documentType": "consultation_note",
        "title": "Follow-up Consultation Notes",
        "description": "Patient follow-up after surgery - recovery assessment",
        "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
        "fileSize": 524288,
        "mimeType": "application/pdf",
        "category": "clinical",
        "uploadDate": "2024-01-15T14:30:00.000Z",
        "uploadedBy": {
          "_id": "507f1f77bcf86cd799439011",
          "firstName": "Dr. Sarah",
          "lastName": "Johnson"
        },
        "tags": ["post-surgery", "follow-up", "recovery"]
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1,
    "limit": 10
  }
}
```

---

### 4. Get Document Details

**Request:**
```
GET {{baseUrl}}/documents/{{documentId}}
```

**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Test Script:**
```javascript
pm.test("Document details retrieved", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('_id');
});

pm.test("Document includes metadata", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('patientId');
    pm.expect(jsonData.data).to.have.property('uploadedBy');
    pm.expect(jsonData.data).to.have.property('minioPath');
});

pm.test("Access logged", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('viewHistory');
    // View should be recorded
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439025",
    "patientId": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "documentType": "consultation_note",
    "title": "Follow-up Consultation Notes",
    "description": "Patient follow-up after surgery - recovery assessment",
    "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "originalFileName": "Follow_up_notes.pdf",
    "fileSize": 524288,
    "mimeType": "application/pdf",
    "minioPath": "medical-documents/507f1f77bcf86cd799439013/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "category": "clinical",
    "consultationId": "507f1f77bcf86cd799439020",
    "tags": ["post-surgery", "follow-up", "recovery"],
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Dr. Sarah",
      "lastName": "Johnson"
    },
    "uploadDate": "2024-01-15T14:30:00.000Z",
    "confidentialityLevel": "standard",
    "status": "active",
    "version": 1,
    "viewHistory": [
      {
        "viewedBy": "507f1f77bcf86cd799439011",
        "viewedAt": "2024-01-15T15:00:00.000Z"
      }
    ]
  }
}
```

---

### 5. Download Document

**Request:**
```
GET {{baseUrl}}/documents/{{documentId}}/download
```

**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**⚠️ Important:**
This endpoint returns the actual file binary data, not JSON.

**To test in Postman:**
1. Send the request
2. Click **"Save Response"** → **"Save to a file"**
3. Choose location and filename
4. File will be downloaded to your computer

**Test Script (for response headers):**
```javascript
pm.test("File download initiated", function () {
    pm.response.to.have.status(200);
});

pm.test("Correct content type", function () {
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/pdf');
});

pm.test("File name in headers", function () {
    var disposition = pm.response.headers.get('Content-Disposition');
    pm.expect(disposition).to.include('attachment');
    pm.expect(disposition).to.include('filename=');
});

pm.test("Content length present", function () {
    pm.expect(pm.response.headers.get('Content-Length')).to.exist;
});
```

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf"
Content-Length: 524288
```

**Response Body:** Binary file data (will be saved as file)

---

### 6. Update Document Info

**Request:**
```
PUT {{baseUrl}}/documents/{{documentId}}
```

**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Updated: Follow-up Consultation Notes - Final",
  "description": "Updated description with additional recovery notes and recommendations",
  "tags": ["post-surgery", "follow-up", "recovery", "completed"],
  "category": "clinical",
  "confidentialityLevel": "high"
}
```

**⚠️ Note:** You can only update metadata, not the file itself. To update the file, upload a new document.

**Test Script:**
```javascript
pm.test("Document updated successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("updated");
});

pm.test("Metadata updated correctly", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.title).to.include("Updated:");
    pm.expect(jsonData.data.tags).to.include("completed");
});

pm.test("File data unchanged", function () {
    var jsonData = pm.response.json();
    // File name and size should remain the same
    pm.expect(jsonData.data.fileName).to.exist;
    pm.expect(jsonData.data.fileSize).to.be.above(0);
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439025",
    "title": "Updated: Follow-up Consultation Notes - Final",
    "description": "Updated description with additional recovery notes and recommendations",
    "tags": ["post-surgery", "follow-up", "recovery", "completed"],
    "category": "clinical",
    "confidentialityLevel": "high",
    "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "fileSize": 524288,
    "uploadDate": "2024-01-15T14:30:00.000Z",
    "lastModified": "2024-01-15T16:00:00.000Z"
  }
}
```

---

### 7. Delete Document

**Request:**
```
DELETE {{baseUrl}}/documents/{{documentId}}
```

**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "reason": "Duplicate document - patient record consolidated"
}
```

**Test Script:**
```javascript
pm.test("Document deleted successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("deleted");
});

pm.test("Deletion reason recorded", function () {
    // Verify that the deletion was logged (you might want to check audit logs)
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**⚠️ Note:** This is a soft delete - the document is marked as deleted but not physically removed from MinIO storage.

---

## Advanced Operations

### 8. Get Consultation Documents

**Request:**
```
GET {{baseUrl}}/documents/consultation/{{consultationId}}
```

**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Test Script:**
```javascript
pm.test("Consultation documents retrieved", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});

pm.test("All documents linked to consultation", function () {
    var jsonData = pm.response.json();
    jsonData.data.forEach(function(doc) {
        pm.expect(doc.consultationId).to.equal(pm.environment.get("consultationId"));
    });
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439025",
      "documentType": "consultation_note",
      "title": "Follow-up Consultation Notes",
      "consultationId": "507f1f77bcf86cd799439020",
      "uploadDate": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

---

### 9. Get Lab Order Documents

**Request:**
```
GET {{baseUrl}}/documents/lab-order/{{labOrderId}}
```

**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Test Script:**
```javascript
pm.test("Lab order documents retrieved", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});

pm.test("Contains lab reports", function () {
    var jsonData = pm.response.json();
    if (jsonData.data.length > 0) {
        pm.expect(jsonData.data[0].documentType).to.equal('lab_report');
    }
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439026",
      "documentType": "lab_report",
      "title": "Complete Blood Count Report",
      "labOrderId": "507f1f77bcf86cd799439012",
      "uploadDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🔄 Complete Test Flow

### Recommended Testing Sequence:
1. ✅ Login as Doctor
2. ✅ Upload Patient Document (with file)
3. ✅ List Patient Documents
4. ✅ Get Document Details
5. ✅ Download Document
6. ✅ Update Document Info
7. ✅ Get Consultation Documents (optional)
8. ✅ Get Lab Order Documents (optional)
9. ✅ Delete Document

---

## 📝 Sample Test Data

### Example 1: Uploading X-Ray Image
```
file: chest_xray.jpg (image file)
patientId: 507f1f77bcf86cd799439013
documentType: imaging_scan
title: Chest X-Ray - Routine Check
description: Annual health screening chest X-ray
category: radiology
tags: ["x-ray", "chest", "routine", "screening"]
confidentialityLevel: standard
```

### Example 2: Uploading Discharge Summary
```
file: discharge_summary.pdf
patientId: 507f1f77bcf86cd799439013
documentType: discharge_summary
title: Hospital Discharge Summary - Post-Surgery
description: Complete discharge summary including medications and follow-up instructions
category: clinical
consultationId: 507f1f77bcf86cd799439020
tags: ["discharge", "post-surgery", "medications", "follow-up"]
confidentialityLevel: high
```

### Example 3: Uploading Medical Certificate
```
file: medical_certificate.pdf
patientId: 507f1f77bcf86cd799439013
documentType: medical_certificate
title: Medical Certificate - Sick Leave
description: Medical certificate for 7 days sick leave due to recovery
category: administrative
tags: ["sick-leave", "certificate"]
confidentialityLevel: standard
documentDate: 2024-01-15
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: File Upload Failed
**Problem:** "File type not allowed" error
**Solution:** 
- Check supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT, JSON
- Verify file size is under 10MB
- Ensure you're using form-data, not raw JSON

### Issue 2: Cannot Download Document
**Problem:** Empty response or error
**Solution:**
- Verify documentId is correct
- Check you have permission to access the document
- Make sure the file exists in MinIO storage

### Issue 3: Permission Denied
**Problem:** 403 Forbidden error
**Solution:**
- Ensure you're logged in as doctor
- Verify token is valid and not expired
- Check you have MANAGE_MEDICAL_DOCUMENTS permission

### Issue 4: Tags Not Parsing
**Problem:** Tags field causes validation error
**Solution:**
- In form-data, use JSON array format: `["tag1", "tag2", "tag3"]`
- Make sure it's valid JSON with double quotes
- Don't use single quotes

---

## 🎯 Quick Start Checklist

- [ ] Set up Postman environment variables
- [ ] Login as doctor and save token
- [ ] Prepare test documents (PDF, images)
- [ ] Set patient ID in environment
- [ ] Upload first document
- [ ] Verify document appears in list
- [ ] Test download functionality
- [ ] Update document metadata
- [ ] Verify all tests pass

---

## 📊 Document Types Reference

| Type | Description | Common Use Cases |
|------|-------------|------------------|
| `lab_report` | Laboratory test results | Blood tests, urinalysis, cultures |
| `prescription` | Prescription documents | Medication prescriptions |
| `consultation_note` | Clinical notes | Doctor's notes, assessments |
| `imaging_scan` | Medical imaging | X-rays, CT, MRI, ultrasound |
| `discharge_summary` | Hospital discharge | Post-hospitalization summaries |
| `referral_letter` | Referral documents | Specialist referrals |
| `consent_form` | Patient consent | Treatment consent forms |
| `medical_certificate` | Medical certificates | Sick leave, fitness certificates |
| `other` | Other documents | Miscellaneous medical docs |

---

## 🔒 Confidentiality Levels

- `standard` - Normal confidentiality
- `high` - High confidentiality (psychiatric, sensitive)
- `restricted` - Restricted access (requires special permission)

---

**📌 Note:** Replace all `{{variables}}` with actual values from your environment or previous responses.

**🔗 Related Documentation:**
- [Lab Technician Guide](./LAB_TECHNICIAN_POSTMAN_GUIDE.md)
- [Patient Collection](./documentTest/PatientCollection.md)
- [Doctor Operations Guide](./DOCTOR_OPERATIONS_POSTMAN_GUIDE.md)
