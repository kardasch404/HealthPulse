# 🧪 Doctor Lab Orders - Postman Testing Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Lab Order Endpoints](#lab-order-endpoints)
- [Testing Workflows](#testing-workflows)
- [Common Test Scripts](#common-test-scripts)
- [Error Scenarios](#error-scenarios)

---

## 🎯 Overview

This guide covers all lab order operations available to doctors in the HealthPulse API, including creating lab orders, adding tests, viewing results, and managing order status.

**Base URL:** `{{baseurl}}/api/v1/lab-orders`

**Authentication:** All endpoints require Bearer token authentication

---

## ✅ Prerequisites

1. **Login as Doctor** first to get access token
2. **Have a valid Consultation ID** (lab orders are linked to consultations)
3. **Have a valid Patient ID**
4. **Have a valid Laboratory ID** (from registered partner laboratories)

### Quick Setup
```http
POST {{baseurl}}/api/v1/auth/login
Content-Type: application/json

{
  "email": "doctor@healthpulse.com",
  "password": "Doctor@123"
}
```

**Save from response:**
- `access_token`
- `doctor_id`

---

## 🔧 Environment Variables

Set these in your Postman environment:

```json
{
  "baseurl": "http://localhost:3000",
  "access_token": "your_jwt_token_here",
  "doctor_id": "doctor_user_id",
  "patient_id": "patient_id",
  "consultation_id": "consultation_id",
  "laboratory_id": "laboratory_id",
  "lab_order_id": "lab_order_id"
}
```

---

## 📝 Lab Order Endpoints

### 1️⃣ Create Lab Order

Create a new laboratory test order for a patient.

**Endpoint:**
```http
POST {{baseurl}}/api/v1/lab-orders
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "consultationId": "{{consultation_id}}",
  "patientId": "{{patient_id}}",
  "laboratoryId": "{{laboratory_id}}",
  "tests": [
    {
      "name": "Complete Blood Count",
      "code": "CBC",
      "category": "Hematology",
      "urgency": "routine",
      "instructions": "Fasting not required",
      "expectedTurnaround": 24
    },
    {
      "name": "Basic Metabolic Panel",
      "code": "BMP",
      "category": "Chemistry",
      "urgency": "routine",
      "instructions": "12-hour fasting required",
      "expectedTurnaround": 12
    },
    {
      "name": "Thyroid Function Panel",
      "code": "TFP",
      "category": "Endocrinology",
      "urgency": "urgent",
      "instructions": "Morning collection preferred",
      "expectedTurnaround": 6
    }
  ],
  "clinicalIndication": "Routine health check and headache workup with thyroid screening",
  "urgency": "routine",
  "notes": "Patient has history of hypertension and family history of thyroid disorders",
  "fastingRequired": true,
  "scheduledDate": "2025-11-05",
  "scheduledTime": "08:00",
  "specialInstructions": "Patient is pregnant - avoid radiation exposure"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `consultationId` | String | ✅ | ID of the consultation this order is related to |
| `patientId` | String | ✅ | ID of the patient |
| `laboratoryId` | String | ✅ | ID of the partner laboratory |
| `tests` | Array | ✅ | Array of test objects (minimum 1) |
| `tests[].name` | String | ✅ | Full name of the test |
| `tests[].code` | String | ✅ | Standard test code (e.g., CBC, BMP) |
| `tests[].category` | String | ✅ | Test category (Hematology, Chemistry, etc.) |
| `tests[].urgency` | String | ✅ | `routine`, `urgent`, or `stat` |
| `tests[].instructions` | String | ❌ | Special instructions for the test |
| `tests[].expectedTurnaround` | Number | ❌ | Expected hours to complete |
| `clinicalIndication` | String | ✅ | Medical reason for ordering tests |
| `urgency` | String | ✅ | Overall order urgency |
| `notes` | String | ❌ | Additional notes for the lab |
| `fastingRequired` | Boolean | ❌ | Whether patient needs to fast |
| `scheduledDate` | String | ❌ | Preferred date (YYYY-MM-DD) |
| `scheduledTime` | String | ❌ | Preferred time (HH:mm) |
| `specialInstructions` | String | ❌ | Special handling instructions |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Lab order created successfully",
  "data": {
    "id": "6907f12a0331f354f7ceee30",
    "orderNumber": "LAB-2025-001234",
    "consultationId": "6907be15a3dc8b0428d4d786",
    "patientId": "69079f40b0bdb85a331dabbf",
    "doctorId": "67c8e9f0a1b2c3d4e5f6a7b8",
    "laboratoryId": "6907ee8e0331f354f7ceee25",
    "tests": [
      {
        "name": "Complete Blood Count",
        "code": "CBC",
        "category": "Hematology",
        "urgency": "routine",
        "status": "pending",
        "instructions": "Fasting not required",
        "expectedTurnaround": 24
      },
      {
        "name": "Basic Metabolic Panel",
        "code": "BMP",
        "category": "Chemistry",
        "urgency": "routine",
        "status": "pending",
        "instructions": "12-hour fasting required",
        "expectedTurnaround": 12
      }
    ],
    "status": "pending",
    "urgency": "routine",
    "clinicalIndication": "Routine health check and headache workup",
    "fastingRequired": true,
    "scheduledDate": "2025-11-05T08:00:00.000Z",
    "createdAt": "2025-11-03T10:30:00.000Z",
    "updatedAt": "2025-11-03T10:30:00.000Z"
  }
}
```

**Test Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Lab order created successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data).to.have.property('orderNumber');
    
    // Save lab order ID for subsequent requests
    pm.environment.set("lab_order_id", jsonData.data.id);
});

pm.test("Order has correct status", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.equal('pending');
});

pm.test("All tests are included", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.tests).to.be.an('array');
    pm.expect(jsonData.data.tests.length).to.be.at.least(1);
});
```

---

### 2️⃣ Add Tests to Order (PUT)

Add additional tests to an existing lab order (only if status is 'pending' or 'draft').

**Endpoint:**
```http
PUT {{baseurl}}/api/v1/lab-orders/{{lab_order_id}}/tests
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Lipid Panel",
  "code": "LIP",
  "category": "Chemistry",
  "urgency": "routine",
  "instructions": "12-hour fasting required",
  "expectedTurnaround": 24
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Test added to lab order successfully",
  "data": {
    "id": "6907f12a0331f354f7ceee30",
    "orderNumber": "LAB-2025-001234",
    "tests": [
      {
        "name": "Complete Blood Count",
        "code": "CBC",
        "category": "Hematology",
        "urgency": "routine",
        "status": "pending"
      },
      {
        "name": "Lipid Panel",
        "code": "LIP",
        "category": "Chemistry",
        "urgency": "routine",
        "status": "pending",
        "instructions": "12-hour fasting required"
      }
    ],
    "status": "pending",
    "updatedAt": "2025-11-03T10:35:00.000Z"
  }
}
```

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Test added successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include('added');
});

pm.test("Tests array increased", function () {
    const jsonData = pm.response.json();
    const testsCount = jsonData.data.tests.length;
    pm.expect(testsCount).to.be.greaterThan(0);
});
```

---

### 3️⃣ List My Lab Orders

Retrieve all lab orders created by the logged-in doctor.

**Endpoint:**
```http
GET {{baseurl}}/api/v1/lab-orders?doctorId={{doctor_id}}&status=pending&page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctorId` | String | ❌ | Filter by doctor (auto-filled for doctors) |
| `patientId` | String | ❌ | Filter by specific patient |
| `laboratoryId` | String | ❌ | Filter by laboratory |
| `status` | String | ❌ | `pending`, `in_progress`, `completed`, `cancelled` |
| `urgency` | String | ❌ | `routine`, `urgent`, `stat` |
| `page` | Number | ❌ | Page number (default: 1) |
| `limit` | Number | ❌ | Results per page (default: 10) |
| `startDate` | String | ❌ | Filter from date (YYYY-MM-DD) |
| `endDate` | String | ❌ | Filter to date (YYYY-MM-DD) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lab orders retrieved successfully",
  "data": {
    "orders": [
      {
        "id": "6907f12a0331f354f7ceee30",
        "orderNumber": "LAB-2025-001234",
        "patient": {
          "id": "69079f40b0bdb85a331dabbf",
          "firstName": "John",
          "lastName": "Doe",
          "dateOfBirth": "1985-05-15"
        },
        "laboratory": {
          "id": "6907ee8e0331f354f7ceee25",
          "name": "Advanced Medical Lab"
        },
        "tests": [
          {
            "name": "Complete Blood Count",
            "code": "CBC",
            "status": "pending"
          },
          {
            "name": "Basic Metabolic Panel",
            "code": "BMP",
            "status": "pending"
          }
        ],
        "status": "pending",
        "urgency": "routine",
        "scheduledDate": "2025-11-05T08:00:00.000Z",
        "createdAt": "2025-11-03T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 25,
      "limit": 10
    }
  }
}
```

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Orders retrieved successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('orders');
    pm.expect(jsonData.data.orders).to.be.an('array');
});

pm.test("Pagination info present", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('pagination');
    pm.expect(jsonData.data.pagination).to.have.property('currentPage');
    pm.expect(jsonData.data.pagination).to.have.property('totalPages');
});

pm.test("Each order has required fields", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.orders.length > 0) {
        const order = jsonData.data.orders[0];
        pm.expect(order).to.have.property('id');
        pm.expect(order).to.have.property('orderNumber');
        pm.expect(order).to.have.property('patient');
        pm.expect(order).to.have.property('tests');
        pm.expect(order).to.have.property('status');
    }
});
```

---

### 4️⃣ Get Lab Order Details

Retrieve complete details of a specific lab order.

**Endpoint:**
```http
GET {{baseurl}}/api/v1/lab-orders/{{lab_order_id}}
Authorization: Bearer {{access_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lab order details retrieved successfully",
  "data": {
    "id": "6907f12a0331f354f7ceee30",
    "orderNumber": "LAB-2025-001234",
    "consultation": {
      "id": "6907be15a3dc8b0428d4d786",
      "chiefComplaint": "Persistent headache",
      "diagnosis": "Tension headache"
    },
    "patient": {
      "id": "69079f40b0bdb85a331dabbf",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1985-05-15",
      "email": "john.doe@example.com",
      "phone": "1234567890"
    },
    "doctor": {
      "id": "67c8e9f0a1b2c3d4e5f6a7b8",
      "firstName": "Dr. Sarah",
      "lastName": "Johnson",
      "specialization": "Internal Medicine"
    },
    "laboratory": {
      "id": "6907ee8e0331f354f7ceee25",
      "name": "Advanced Medical Lab",
      "address": "123 Medical Plaza",
      "phone": "9876543210",
      "email": "info@advancedlab.com"
    },
    "tests": [
      {
        "name": "Complete Blood Count",
        "code": "CBC",
        "category": "Hematology",
        "urgency": "routine",
        "status": "in_progress",
        "instructions": "Fasting not required",
        "expectedTurnaround": 24,
        "results": null
      },
      {
        "name": "Basic Metabolic Panel",
        "code": "BMP",
        "category": "Chemistry",
        "urgency": "routine",
        "status": "completed",
        "instructions": "12-hour fasting required",
        "expectedTurnaround": 12,
        "results": {
          "glucose": "95 mg/dL (Normal: 70-100)",
          "sodium": "140 mEq/L (Normal: 135-145)",
          "potassium": "4.2 mEq/L (Normal: 3.5-5.0)",
          "interpretation": "All values within normal range"
        }
      }
    ],
    "status": "in_progress",
    "urgency": "routine",
    "clinicalIndication": "Routine health check and headache workup with thyroid screening",
    "notes": "Patient has history of hypertension and family history of thyroid disorders",
    "fastingRequired": true,
    "scheduledDate": "2025-11-05T08:00:00.000Z",
    "scheduledTime": "08:00",
    "specialInstructions": "Patient is pregnant - avoid radiation exposure",
    "sampleCollectedAt": "2025-11-05T08:15:00.000Z",
    "estimatedCompletionDate": "2025-11-06T08:00:00.000Z",
    "createdAt": "2025-11-03T10:30:00.000Z",
    "updatedAt": "2025-11-05T09:00:00.000Z"
  }
}
```

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Order details retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data).to.have.property('orderNumber');
});

pm.test("Complete patient information", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.patient).to.have.property('firstName');
    pm.expect(jsonData.data.patient).to.have.property('lastName');
    pm.expect(jsonData.data.patient).to.have.property('email');
});

pm.test("Laboratory information included", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.laboratory).to.have.property('name');
    pm.expect(jsonData.data.laboratory).to.have.property('address');
});

pm.test("Tests array exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.tests).to.be.an('array');
    pm.expect(jsonData.data.tests.length).to.be.greaterThan(0);
});
```

---

### 5️⃣ View Lab Results

View the results of completed lab tests.

**Endpoint:**
```http
GET {{baseurl}}/api/v1/lab-orders/{{lab_order_id}}/results
Authorization: Bearer {{access_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lab results retrieved successfully",
  "data": {
    "orderId": "6907f12a0331f354f7ceee30",
    "orderNumber": "LAB-2025-001234",
    "patient": {
      "id": "69079f40b0bdb85a331dabbf",
      "firstName": "John",
      "lastName": "Doe"
    },
    "completedTests": [
      {
        "name": "Complete Blood Count",
        "code": "CBC",
        "category": "Hematology",
        "status": "completed",
        "completedAt": "2025-11-05T14:30:00.000Z",
        "results": {
          "wbc": "7.5 x10^9/L (Normal: 4.5-11.0)",
          "rbc": "5.2 x10^12/L (Normal: 4.5-5.9)",
          "hemoglobin": "14.5 g/dL (Normal: 13.5-17.5)",
          "hematocrit": "42% (Normal: 38-50%)",
          "platelets": "250 x10^9/L (Normal: 150-400)",
          "interpretation": "All values within normal limits",
          "criticalValues": [],
          "flags": []
        },
        "performedBy": {
          "id": "lab_tech_id",
          "name": "Lab Technician Name"
        },
        "reviewedBy": {
          "id": "pathologist_id",
          "name": "Dr. Pathologist Name"
        }
      },
      {
        "name": "Basic Metabolic Panel",
        "code": "BMP",
        "category": "Chemistry",
        "status": "completed",
        "completedAt": "2025-11-05T12:00:00.000Z",
        "results": {
          "glucose": "95 mg/dL (Normal: 70-100)",
          "sodium": "140 mEq/L (Normal: 135-145)",
          "potassium": "4.2 mEq/L (Normal: 3.5-5.0)",
          "chloride": "102 mEq/L (Normal: 96-106)",
          "co2": "24 mEq/L (Normal: 23-29)",
          "bun": "15 mg/dL (Normal: 7-20)",
          "creatinine": "1.0 mg/dL (Normal: 0.7-1.3)",
          "interpretation": "All metabolic parameters within normal range",
          "criticalValues": [],
          "flags": []
        }
      }
    ],
    "pendingTests": [
      {
        "name": "Thyroid Function Panel",
        "code": "TFP",
        "status": "in_progress",
        "expectedCompletion": "2025-11-05T18:00:00.000Z"
      }
    ],
    "overallStatus": "partial_results",
    "reportUrl": "https://lab.healthpulse.com/reports/LAB-2025-001234.pdf",
    "generatedAt": "2025-11-05T14:35:00.000Z"
  }
}
```

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Results retrieved successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('completedTests');
});

pm.test("Completed tests have results", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.completedTests.length > 0) {
        const test = jsonData.data.completedTests[0];
        pm.expect(test).to.have.property('results');
        pm.expect(test.status).to.equal('completed');
    }
});

pm.test("Report URL available if completed", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.overallStatus === 'completed') {
        pm.expect(jsonData.data).to.have.property('reportUrl');
    }
});
```

---

### 6️⃣ Cancel Lab Order

Cancel a lab order (only if status is 'pending').

**Endpoint:**
```http
POST {{baseurl}}/api/v1/lab-orders/{{lab_order_id}}/cancel
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Patient requested cancellation - financial concerns",
  "notifyLaboratory": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lab order cancelled successfully",
  "data": {
    "id": "6907f12a0331f354f7ceee30",
    "orderNumber": "LAB-2025-001234",
    "status": "cancelled",
    "cancellationReason": "Patient requested cancellation - financial concerns",
    "cancelledBy": "67c8e9f0a1b2c3d4e5f6a7b8",
    "cancelledAt": "2025-11-03T11:00:00.000Z"
  }
}
```

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Order cancelled successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.status).to.equal('cancelled');
});

pm.test("Cancellation reason recorded", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('cancellationReason');
    pm.expect(jsonData.data).to.have.property('cancelledAt');
});
```

---

## 🔄 Testing Workflows

### Complete Lab Order Workflow

```javascript
// 1. Login as Doctor
POST {{baseurl}}/api/v1/auth/login

// 2. Create Consultation (if needed)
POST {{baseurl}}/api/v1/consultations

// 3. Create Lab Order
POST {{baseurl}}/api/v1/lab-orders

// 4. Add Additional Test (if needed)
PUT {{baseurl}}/api/v1/lab-orders/{{lab_order_id}}/tests

// 5. View Order Details
GET {{baseurl}}/api/v1/lab-orders/{{lab_order_id}}

// 6. List All My Orders
GET {{baseurl}}/api/v1/lab-orders?doctorId={{doctor_id}}

// 7. View Results (when ready)
GET {{baseurl}}/api/v1/lab-orders/{{lab_order_id}}/results

// 8. Cancel Order (if needed)
POST {{baseurl}}/api/v1/lab-orders/{{lab_order_id}}/cancel
```

---

## ✅ Common Test Scripts

### Collection Pre-request Script

Add this to your collection to auto-refresh tokens:

```javascript
const accessToken = pm.environment.get("access_token");
const refreshToken = pm.environment.get("refresh_token");

if (!accessToken && refreshToken) {
    pm.sendRequest({
        url: pm.environment.get("baseurl") + "/api/v1/auth/refresh",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({ refreshToken: refreshToken })
        }
    }, function (err, response) {
        if (!err && response.code === 200) {
            const data = response.json();
            pm.environment.set("access_token", data.data.accessToken);
        }
    });
}
```

### Global Test Script

```javascript
// Check response time
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Check response structure
pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('message');
});

// Check content type
pm.test("Content-Type is application/json", function () {
    pm.response.to.have.header("Content-Type", /application\/json/);
});
```

---

## ❌ Error Scenarios

### 1. Missing Required Fields

**Request:**
```json
{
  "patientId": "{{patient_id}}",
  "laboratoryId": "{{laboratory_id}}"
  // Missing consultationId and tests
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "consultationId",
      "message": "Consultation ID is required"
    },
    {
      "field": "tests",
      "message": "At least one test is required"
    }
  ]
}
```

### 2. Invalid Laboratory ID

**Response (404):**
```json
{
  "success": false,
  "message": "Laboratory not found or not active"
}
```

### 3. Unauthorized Access

**Response (403):**
```json
{
  "success": false,
  "message": "You are not authorized to view this lab order"
}
```

### 4. Cannot Add Test to Completed Order

**Response (400):**
```json
{
  "success": false,
  "message": "Cannot add tests to order with status: in_progress"
}
```

### 5. Cannot Cancel In-Progress Order

**Response (400):**
```json
{
  "success": false,
  "message": "Cannot cancel order. Sample collection has already begun."
}
```

---

## 📊 Test Categories Reference

Common test categories you can use:

- **Hematology**: CBC, Blood Typing, Coagulation Studies
- **Chemistry**: BMP, CMP, Lipid Panel, Liver Function Tests
- **Endocrinology**: Thyroid Panel, HbA1c, Hormone Tests
- **Microbiology**: Culture & Sensitivity, Rapid Tests
- **Immunology**: Antibody Tests, Allergen Testing
- **Molecular**: PCR Tests, Genetic Testing
- **Urinalysis**: Routine UA, Urine Culture
- **Toxicology**: Drug Screening, Therapeutic Drug Monitoring

---

## 🎯 Status Flow

```
pending → in_progress → completed
   ↓
cancelled
```

**Status Definitions:**
- `pending`: Order created, awaiting sample collection
- `in_progress`: Sample collected, tests being performed
- `completed`: All tests finished, results available
- `cancelled`: Order cancelled before completion

---

## 📝 Best Practices

1. **Always link to consultation**: Lab orders should reference a consultation
2. **Specify urgency correctly**: Use `stat` only for true emergencies
3. **Provide clinical indication**: Helps lab prioritize and interpret results
4. **Include special instructions**: Mention pregnancy, medications, allergies
5. **Check fasting requirements**: Inform patient of preparation needs
6. **Review before submitting**: Once submitted, modifications are limited

---

## 🔗 Related Endpoints

- **Consultations**: `/api/v1/consultations`
- **Patients**: `/api/v1/patients`
- **Laboratories**: `/api/v1/laboratories`

---

**Last Updated:** November 3, 2025  
**API Version:** 1.0  
**Guide Version:** 1.0

**Note:** To implement these endpoints, you need to create the Lab Order module (Model, Controller, Service, Routes, and Validators) in your HealthPulse backend.
