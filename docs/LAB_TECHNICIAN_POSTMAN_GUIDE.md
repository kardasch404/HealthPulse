# 🧪 Lab Technician Operations - Complete Postman Testing Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Authentication Setup](#authentication-setup)
- [Results Management](#results-management)
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
- **Lab Technician Credentials**: Email and password with `lab_technician` role
- **Valid Lab Order IDs**: From existing lab orders in the system

### Environment Variables Setup in Postman
```javascript
baseUrl: http://localhost:3000/api/v1
labTechToken: (will be set after login)
labOrderId: (will be set from test data)
testId: (will be set from lab order)
```

---

## Authentication Setup

### 1. Login as Lab Technician

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
  "email": "lab.technician@hospital.com",
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
    pm.environment.set("labTechToken", jsonData.data.accessToken);
    console.log("✅ Lab Technician token saved");
});

pm.test("User has lab_technician role", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.user.role).to.equal('lab_technician');
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
      "email": "lab.technician@hospital.com",
      "role": "lab_technician",
      "firstName": "John",
      "lastName": "Smith"
    }
  }
}
```

---

## Results Management

### 2. Get Pending Lab Orders

**Request:**
```
GET {{baseUrl}}/lab-orders?status=pending&laboratoryId=YOUR_LAB_ID
```

**Headers:**
```
Authorization: Bearer {{labTechToken}}
```

**Query Parameters:**
- `status`: pending
- `laboratoryId`: Your laboratory ID (optional filter)

**Test Script:**
```javascript
pm.test("Lab orders retrieved successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.orders).to.be.an('array');
    
    if (jsonData.data.orders.length > 0) {
        // Save first order ID for next tests
        pm.environment.set("labOrderId", jsonData.data.orders[0]._id);
        pm.environment.set("testId", jsonData.data.orders[0].tests[0]._id);
        console.log("✅ Lab Order ID saved:", jsonData.data.orders[0]._id);
        console.log("✅ Test ID saved:", jsonData.data.orders[0].tests[0]._id);
    }
});

pm.test("Orders have required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.data.orders.length > 0) {
        var order = jsonData.data.orders[0];
        pm.expect(order).to.have.property('orderNumber');
        pm.expect(order).to.have.property('patientId');
        pm.expect(order).to.have.property('tests');
    }
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lab orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "orderNumber": "LAB-2024-0001",
        "patientId": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "Jane",
          "lastName": "Doe"
        },
        "tests": [
          {
            "_id": "507f1f77bcf86cd799439014",
            "testName": "Complete Blood Count",
            "testCode": "CBC",
            "status": "pending"
          }
        ],
        "status": "pending",
        "urgency": "routine"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pages": 1
    }
  }
}
```

---

### 3. Upload Lab Results (JSON Format)

**Request:**
```
POST {{baseUrl}}/lab-orders/{{labOrderId}}/upload-results
```

**Headers:**
```
Authorization: Bearer {{labTechToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "tests": [
    {
      "testId": "{{testId}}",
      "results": {
        "WBC": {
          "value": 7.5,
          "unit": "10^3/μL",
          "referenceRange": "4.0-11.0",
          "status": "normal"
        },
        "RBC": {
          "value": 4.8,
          "unit": "10^6/μL",
          "referenceRange": "4.5-5.5",
          "status": "normal"
        },
        "Hemoglobin": {
          "value": 14.2,
          "unit": "g/dL",
          "referenceRange": "13.5-17.5",
          "status": "normal"
        },
        "Hematocrit": {
          "value": 42.5,
          "unit": "%",
          "referenceRange": "38.0-50.0",
          "status": "normal"
        }
      },
      "interpretation": "All values within normal range. No abnormalities detected.",
      "criticalValues": [],
      "resultNotes": "Sample collected at 09:00 AM, processed within 2 hours."
    }
  ]
}
```

**Test Script:**
```javascript
pm.test("Results uploaded successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("uploaded successfully");
});

pm.test("Response contains lab order ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('labOrderId');
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lab results uploaded successfully",
  "data": {
    "labOrderId": "507f1f77bcf86cd799439012"
  }
}
```

---

### 4. Upload Lab Report PDF

**Request:**
```
POST {{baseUrl}}/lab-orders/{{labOrderId}}/upload-report
```

**Headers:**
```
Authorization: Bearer {{labTechToken}}
```

**Body (form-data):**
```
file: [Select PDF file from your computer]
title: Complete Blood Count Report
description: CBC results for patient Jane Doe - Order LAB-2024-0001
```

**⚠️ Important for Postman:**
1. Select **Body** tab
2. Choose **form-data** (NOT raw)
3. Add key `file` with type **File**
4. Click "Select Files" and choose your PDF
5. Add keys `title` and `description` as **Text** type

**Test Script:**
```javascript
pm.test("Report uploaded successfully", function () {
    pm.response.to.have.status(201);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("uploaded successfully");
});

pm.test("Document metadata is correct", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('_id');
    pm.expect(jsonData.data.documentType).to.equal('lab_report');
    pm.expect(jsonData.data.fileName).to.include('.pdf');
    pm.expect(jsonData.data).to.have.property('minioPath');
    
    // Save document ID for later
    pm.environment.set("documentId", jsonData.data._id);
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "patientId": "507f1f77bcf86cd799439013",
    "documentType": "lab_report",
    "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "originalFileName": "CBC_Report_Patient_123.pdf",
    "fileSize": 524288,
    "mimeType": "application/pdf",
    "minioPath": "medical-documents/507f1f77bcf86cd799439013/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "title": "Complete Blood Count Report",
    "description": "CBC results for patient Jane Doe - Order LAB-2024-0001",
    "labOrderId": "507f1f77bcf86cd799439012",
    "uploadedBy": "507f1f77bcf86cd799439011",
    "uploadDate": "2024-01-15T10:30:00.000Z",
    "status": "active"
  }
}
```

---

### 5. Update Test Results

**Request:**
```
POST {{baseUrl}}/lab-orders/{{labOrderId}}/tests/{{testId}}/results
```

**Headers:**
```
Authorization: Bearer {{labTechToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "results": {
    "WBC": {
      "value": 7.8,
      "unit": "10^3/μL",
      "referenceRange": "4.0-11.0",
      "status": "normal"
    },
    "RBC": {
      "value": 4.9,
      "unit": "10^6/μL",
      "referenceRange": "4.5-5.5",
      "status": "normal"
    }
  },
  "interpretation": "Updated results - all values remain within normal range.",
  "resultNotes": "Re-verified results after calibration check."
}
```

**Test Script:**
```javascript
pm.test("Results updated successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("updated");
});

pm.test("Updated lab order returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('_id');
    pm.expect(jsonData.data.tests).to.be.an('array');
});
```

---

### 6. Mark Lab Order as Validated

**Request:**
```
POST {{baseUrl}}/lab-orders/{{labOrderId}}/validate
```

**Headers:**
```
Authorization: Bearer {{labTechToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "validationNotes": "All results verified and reviewed. Quality control passed. No critical values detected."
}
```

**Test Script:**
```javascript
pm.test("Lab order validated successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("validated");
});

pm.test("Status changed to completed", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.equal('completed');
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lab order validated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "orderNumber": "LAB-2024-0001",
    "status": "completed",
    "completedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### 7. View Result History

**Request:**
```
GET {{baseUrl}}/lab-orders/{{labOrderId}}/result-history
```

**Headers:**
```
Authorization: Bearer {{labTechToken}}
```

**Test Script:**
```javascript
pm.test("Result history retrieved successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('orderNumber');
    pm.expect(jsonData.data).to.have.property('statusHistory');
    pm.expect(jsonData.data).to.have.property('tests');
});

pm.test("History includes test details", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.tests).to.be.an('array');
    if (jsonData.data.tests.length > 0) {
        var test = jsonData.data.tests[0];
        pm.expect(test).to.have.property('testName');
        pm.expect(test).to.have.property('status');
        pm.expect(test).to.have.property('results');
    }
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Result history retrieved successfully",
  "data": {
    "orderNumber": "LAB-2024-0001",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T09:00:00.000Z",
        "updatedBy": "507f1f77bcf86cd799439010"
      },
      {
        "status": "in_progress",
        "timestamp": "2024-01-15T09:30:00.000Z",
        "updatedBy": "507f1f77bcf86cd799439011"
      },
      {
        "status": "completed",
        "timestamp": "2024-01-15T11:00:00.000Z",
        "updatedBy": "507f1f77bcf86cd799439011",
        "reason": "Validated by technician: All results verified and reviewed..."
      }
    ],
    "tests": [
      {
        "testName": "Complete Blood Count",
        "testCode": "CBC",
        "status": "completed",
        "results": {
          "WBC": {
            "value": 7.8,
            "unit": "10^3/μL",
            "referenceRange": "4.0-11.0",
            "status": "normal"
          }
        },
        "completedAt": "2024-01-15T10:45:00.000Z",
        "technician": "507f1f77bcf86cd799439011"
      }
    ]
  }
}
```

---

## 🔄 Complete Test Flow

### Recommended Testing Sequence:
1. ✅ Login as Lab Technician
2. ✅ Get Pending Lab Orders
3. ✅ Upload Lab Results (JSON)
4. ✅ Upload Lab Report PDF
5. ✅ Update Test Results (if needed)
6. ✅ Mark as Validated
7. ✅ View Result History

---

## 📝 Sample Test Data

### Example: Complete Blood Count (CBC) Results
```json
{
  "tests": [
    {
      "testId": "507f1f77bcf86cd799439014",
      "results": {
        "WBC": {
          "value": 7.5,
          "unit": "10^3/μL",
          "referenceRange": "4.0-11.0",
          "status": "normal"
        },
        "RBC": {
          "value": 4.8,
          "unit": "10^6/μL",
          "referenceRange": "4.5-5.5",
          "status": "normal"
        },
        "Hemoglobin": {
          "value": 14.2,
          "unit": "g/dL",
          "referenceRange": "13.5-17.5",
          "status": "normal"
        },
        "Platelets": {
          "value": 250,
          "unit": "10^3/μL",
          "referenceRange": "150-400",
          "status": "normal"
        }
      },
      "interpretation": "All parameters within normal limits.",
      "criticalValues": [],
      "resultNotes": "Sample quality: Good. No hemolysis detected."
    }
  ]
}
```

### Example: Critical Values Alert
```json
{
  "tests": [
    {
      "testId": "507f1f77bcf86cd799439015",
      "results": {
        "Glucose": {
          "value": 450,
          "unit": "mg/dL",
          "referenceRange": "70-100",
          "status": "critical"
        }
      },
      "interpretation": "CRITICAL: Severely elevated glucose level. Immediate physician notification required.",
      "criticalValues": [
        {
          "parameter": "Glucose",
          "value": 450,
          "severity": "critical",
          "notifiedAt": "2024-01-15T10:00:00.000Z"
        }
      ],
      "resultNotes": "Physician Dr. Smith notified at 10:00 AM."
    }
  ]
}
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: File Upload Failed
**Problem:** "No file uploaded" error
**Solution:** 
- In Postman, use **form-data** not raw JSON
- Set key type to **File** not Text
- Ensure file size is under 10MB

### Issue 2: Permission Denied
**Problem:** 403 Forbidden error
**Solution:**
- Verify you're logged in as lab_technician role
- Check token is set: `{{labTechToken}}`
- Ensure token hasn't expired (re-login if needed)

### Issue 3: Invalid Test ID
**Problem:** "Test not found" error
**Solution:**
- First fetch the lab order with GET /lab-orders/:id
- Copy the correct test `_id` from the response
- Use that exact ID in your request

---

## 🎯 Quick Start Checklist

- [ ] Set up Postman environment variables
- [ ] Login as lab technician and save token
- [ ] Get pending lab orders
- [ ] Save lab order ID and test ID
- [ ] Upload JSON results
- [ ] Upload PDF report
- [ ] Mark order as validated
- [ ] Verify all tests pass

---

**📌 Note:** Replace all `{{variables}}` with actual values from your environment or previous responses.

**🔗 Related Documentation:**
- [Doctor Medical Documents Guide](./DOCTOR_MEDICAL_DOCUMENTS_POSTMAN_GUIDE.md)
- [Lab Orders Module](./IMPLEMENTATION_SUMMARY.md)
