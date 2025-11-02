# HealthPulse API - Lab Technician Operations Collection

## 📋 Lab Technician Collection Overview

This document provides detailed API documentation for all lab technician operations in the HealthPulse system. Lab technicians can manage lab orders, process tests, record results, and handle their laboratory operations.

---

## 🔐 Authentication

### Lab Technician Login
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "labtech@healthpulse.com",
  "password": "LabTech@123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
    pm.environment.set("lab_technician_id", response.data.user.id);
    pm.environment.set("laboratory_id", response.data.user.laboratoryId);
}
```

---

## 📁 8. Lab Technician Operations ✨ NEW

### 📂 Authentication

#### **Lab Technician Login**
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "labtech@healthpulse.com",
  "password": "LabTech@123"
}
```

#### **View My Laboratory Info**
```http
GET {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Laboratory information retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('name');
    pm.expect(jsonData.data).to.have.property('licenseNumber');
    pm.expect(jsonData.data).to.have.property('accreditation');
    pm.expect(jsonData.data).to.have.property('services');
});
```

---

### 📂 Lab Order Management

#### **View Pending Orders**
```http
GET {{base_url}}/api/v1/lab-orders/laboratory/{{laboratory_id}}?status=pending&page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `status` (optional): Filter by status (pending/in_progress/completed/cancelled)
- `page` (optional): Page number
- `limit` (optional): Items per page
- `priority` (optional): Filter by priority (stat/urgent/routine)
- `testType` (optional): Filter by test type
- `patientName` (optional): Search by patient name
- `doctorName` (optional): Filter by ordering doctor
- `orderDate` (optional): Filter by order date

**Test Script:**
```javascript
pm.test("Pending orders for laboratory", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('orders');
    jsonData.data.orders.forEach(order => {
        pm.expect(order.laboratoryId).to.equal(pm.environment.get("laboratory_id"));
        pm.expect(order.status).to.equal('pending');
    });
});
```

#### **View All Orders**
```http
GET {{base_url}}/api/v1/lab-orders/laboratory/{{laboratory_id}}?page=1&limit=20
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- Same as pending orders, but includes all statuses

#### **Get Order Details**
```http
GET {{base_url}}/api/v1/lab-orders/{{lab_order_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Order belongs to laboratory", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.laboratoryId).to.equal(pm.environment.get("laboratory_id"));
});

pm.test("Order includes test details", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('tests');
    pm.expect(jsonData.data.tests).to.be.an('array');
    pm.expect(jsonData.data.tests[0]).to.have.property('name');
    pm.expect(jsonData.data.tests[0]).to.have.property('code');
});
```

#### **Update Order Status**

##### **Mark as In Progress**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_progress",
  "technicianId": "{{lab_technician_id}}",
  "startedAt": "2024-11-18T09:00:00Z",
  "notes": "Sample received and logged. Beginning testing procedures.",
  "estimatedCompletionTime": "2024-11-18T15:00:00Z",
  "sampleStatus": {
    "received": true,
    "quality": "good",
    "volume": "adequate",
    "labeling": "correct",
    "temperature": "appropriate"
  }
}
```

##### **Mark as Completed**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "completed",
  "technicianId": "{{lab_technician_id}}",
  "completedAt": "2024-11-18T14:30:00Z",
  "notes": "All tests completed successfully. Results reviewed and validated.",
  "qualityControl": {
    "passed": true,
    "controlsRun": ["positive_control", "negative_control"],
    "calibrationChecked": true,
    "instrumentMaintenance": "up_to_date"
  },
  "reviewedBy": "{{lab_supervisor_id}}",
  "reviewNotes": "Results within normal ranges. No critical values noted."
}
```

##### **Mark as Rejected**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "rejected",
  "technicianId": "{{lab_technician_id}}",
  "rejectedAt": "2024-11-18T09:15:00Z",
  "rejectionReason": "insufficient_sample",
  "rejectionCategory": "pre_analytical",
  "notes": "Sample volume insufficient for requested tests. Requesting new sample collection.",
  "notifyDoctor": true,
  "notifyPatient": false,
  "recommendations": "Please collect minimum 5ml blood sample in purple top tube"
}
```

**Test Script:**
```javascript
pm.test("Order status updated successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.updatedBy).to.equal(pm.environment.get("lab_technician_id"));
});
```

#### **Add Lab Results**
```http
POST {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "technicianId": "{{lab_technician_id}}",
  "resultDate": "2024-11-18T14:30:00Z",
  "results": [
    {
      "testCode": "CBC",
      "testName": "Complete Blood Count",
      "components": [
        {
          "name": "White Blood Cells",
          "value": 7.5,
          "unit": "K/uL",
          "referenceRange": "4.0-11.0",
          "flag": "normal",
          "critical": false
        },
        {
          "name": "Red Blood Cells",
          "value": 4.2,
          "unit": "M/uL",
          "referenceRange": "3.8-5.2",
          "flag": "normal",
          "critical": false
        },
        {
          "name": "Hemoglobin",
          "value": 13.8,
          "unit": "g/dL",
          "referenceRange": "12.0-16.0",
          "flag": "normal",
          "critical": false
        },
        {
          "name": "Hematocrit",
          "value": 41.2,
          "unit": "%",
          "referenceRange": "36.0-48.0",
          "flag": "normal",
          "critical": false
        }
      ]
    },
    {
      "testCode": "BMP",
      "testName": "Basic Metabolic Panel",
      "components": [
        {
          "name": "Glucose",
          "value": 95,
          "unit": "mg/dL",
          "referenceRange": "70-110",
          "flag": "normal",
          "critical": false
        },
        {
          "name": "Creatinine",
          "value": 1.1,
          "unit": "mg/dL",
          "referenceRange": "0.7-1.3",
          "flag": "normal",
          "critical": false
        }
      ]
    }
  ],
  "methodology": "Automated analyzer",
  "instrument": "Sysmex XN-1000",
  "calibrationDate": "2024-11-15",
  "qualityControlResults": {
    "level1": "passed",
    "level2": "passed",
    "level3": "passed"
  },
  "technicalNotes": "All controls within acceptable ranges. No instrument flags.",
  "criticalValues": false
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("lab_results_id", response.data.id);
    pm.test("Lab results recorded by technician", function () {
        pm.expect(response.data.technicianId).to.equal(pm.environment.get("lab_technician_id"));
    });
}
```

#### **Search Orders**
```http
GET {{base_url}}/api/v1/lab-orders/search?q={{search_term}}&laboratoryId={{laboratory_id}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `q` (required): Search term (patient name, order ID, test name)
- `status` (optional): Filter by status
- `fromDate` (optional): Start date for search
- `toDate` (optional): End date for search
- `limit` (optional): Number of results

#### **View Order History**
```http
GET {{base_url}}/api/v1/lab-orders/laboratory/{{laboratory_id}}/history?page=1&limit=50
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `fromDate` (optional): Start date for history
- `toDate` (optional): End date for history
- `technicianId` (optional): Filter by specific technician
- `testType` (optional): Filter by test type

---

### 📂 Sample Management (Lab Technician-specific)

#### **Log Sample Receipt**
```http
POST {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/sample-receipt
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "technicianId": "{{lab_technician_id}}",
  "receivedAt": "2024-11-18T08:30:00Z",
  "sampleDetails": {
    "type": "blood",
    "volume": "5ml",
    "container": "purple_top_tube",
    "temperature": "room_temperature",
    "condition": "good",
    "labeling": "correct"
  },
  "collectionInfo": {
    "collectedAt": "2024-11-18T07:45:00Z",
    "collectedBy": "Nurse Smith",
    "fasting": true,
    "patientCondition": "stable"
  },
  "storageLocation": "Refrigerator A-Section 3",
  "barcodeScanned": true,
  "notes": "Sample received in good condition, properly labeled"
}
```

#### **Update Sample Status**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/sample-status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "processed",
  "processedBy": "{{lab_technician_id}}",
  "processedAt": "2024-11-18T10:15:00Z",
  "aliquots": [
    {
      "volume": "1ml",
      "location": "Freezer B-Rack 5",
      "purpose": "chemistry_panel"
    },
    {
      "volume": "1ml", 
      "location": "Freezer B-Rack 5",
      "purpose": "hematology"
    }
  ]
}
```

---

### 📂 Quality Control (Lab Technician-specific)

#### **Record Quality Control Results**
```http
POST {{base_url}}/api/v1/laboratories/{{laboratory_id}}/quality-control
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "technicianId": "{{lab_technician_id}}",
  "testDate": "2024-11-18T09:00:00Z",
  "instrument": "Sysmex XN-1000",
  "controlType": "daily_qc",
  "controlLevels": [
    {
      "level": "normal",
      "lotNumber": "QC123456",
      "expiryDate": "2025-03-15",
      "results": [
        {
          "parameter": "WBC",
          "expected": 7.5,
          "observed": 7.6,
          "unit": "K/uL",
          "deviation": 1.3,
          "acceptable": true
        },
        {
          "parameter": "RBC",
          "expected": 4.2,
          "observed": 4.1,
          "unit": "M/uL",
          "deviation": -2.4,
          "acceptable": true
        }
      ]
    }
  ],
  "calibrationStatus": "current",
  "maintenanceStatus": "up_to_date",
  "issues": [],
  "notes": "All QC results within acceptable limits"
}
```

#### **Report Quality Issues**
```http
POST {{base_url}}/api/v1/laboratories/{{laboratory_id}}/quality-issues
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reportedBy": "{{lab_technician_id}}",
  "issueType": "instrument_malfunction",
  "severity": "medium",
  "instrument": "Chemistry Analyzer X200",
  "description": "Glucose results consistently 10% higher than expected",
  "impactedTests": ["Glucose", "HbA1c"],
  "actionTaken": "Recalibrated instrument, ran additional QC",
  "followUpRequired": true,
  "notifySupervisor": true
}
```

---

### 📂 Critical Values Management (Lab Technician-specific)

#### **Report Critical Value**
```http
POST {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/critical-value
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "technicianId": "{{lab_technician_id}}",
  "criticalResult": {
    "testName": "Glucose",
    "value": 45,
    "unit": "mg/dL",
    "referenceRange": "70-110",
    "criticalThreshold": "<60 or >400"
  },
  "notifiedPersons": [
    {
      "role": "ordering_physician",
      "name": "Dr. Johnson",
      "contactMethod": "phone",
      "notifiedAt": "2024-11-18T11:30:00Z",
      "response": "acknowledged"
    }
  ],
  "urgency": "immediate",
  "followUpRequired": true,
  "notes": "Critical low glucose value. Doctor notified immediately."
}
```

---

### 📂 My Profile

#### **View My Profile**
```http
GET {{base_url}}/api/v1/users/{{lab_technician_id}}
Authorization: Bearer {{access_token}}
```

#### **Update My Profile**
```http
PUT {{base_url}}/api/v1/users/{{lab_technician_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "1234567899",
  "licenseNumber": "LAB-2024-002",
  "laboratoryId": "{{laboratory_id}}",
  "specialization": "Clinical Chemistry and Hematology",
  "certifications": ["MLT", "ASCP", "AMT"],
  "experience": 6,
  "workingHours": {
    "monday": {"start": "07:00", "end": "15:00"},
    "tuesday": {"start": "07:00", "end": "15:00"},
    "wednesday": {"start": "07:00", "end": "15:00"},
    "thursday": {"start": "07:00", "end": "15:00"},
    "friday": {"start": "07:00", "end": "15:00"}
  },
  "shift": "Day Shift",
  "department": "Clinical Laboratory",
  "authorizedTests": [
    "Hematology",
    "Clinical Chemistry",
    "Urinalysis",
    "Coagulation"
  ],
  "languagesSpoken": ["English", "French"]
}
```

#### **Change Password**
```http
PUT {{base_url}}/api/v1/users/{{lab_technician_id}}/password
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "LabTech@123",
  "newPassword": "NewLabTech@456",
  "confirmPassword": "NewLabTech@456"
}
```

---

## 🧪 Common Test Scripts

### Success Response Test
```javascript
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});
```

### Lab Technician-specific Tests
```javascript
pm.test("Lab technician has required permissions", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.user) {
        pm.expect(jsonData.data.user.role.name).to.equal('lab_technician');
    }
});

pm.test("Order belongs to technician's laboratory", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.laboratoryId) {
        pm.expect(jsonData.data.laboratoryId).to.equal(pm.environment.get("laboratory_id"));
    }
});

pm.test("Results recorded by technician", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.technicianId) {
        pm.expect(jsonData.data.technicianId).to.equal(pm.environment.get("lab_technician_id"));
    }
});
```

### Lab Results Validation Tests
```javascript
pm.test("Lab results have required components", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.results) {
        jsonData.data.results.forEach(result => {
            pm.expect(result).to.have.property('testName');
            pm.expect(result).to.have.property('components');
            pm.expect(result.components).to.be.an('array');
            result.components.forEach(component => {
                pm.expect(component).to.have.property('name');
                pm.expect(component).to.have.property('value');
                pm.expect(component).to.have.property('unit');
                pm.expect(component).to.have.property('referenceRange');
            });
        });
    }
});

pm.test("Quality control data included", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.qualityControlResults) {
        pm.expect(jsonData.data.qualityControlResults).to.be.an('object');
    }
});
```

### Critical Values Tests
```javascript
pm.test("Critical values properly flagged", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.results) {
        jsonData.data.results.forEach(result => {
            result.components.forEach(component => {
                if (component.critical) {
                    pm.expect(component).to.have.property('criticalThreshold');
                }
            });
        });
    }
});
```

---

## 🔧 Environment Variables

Required variables for lab technician operations:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "lab_technician_id": "",
  "laboratory_id": "",
  "lab_order_id": "",
  "lab_results_id": "",
  "patient_id": "",
  "doctor_id": "",
  "sample_id": "",
  "qc_id": "",
  "lab_supervisor_id": ""
}
```

---

## 📝 Notes

1. **Order Processing**: Complete workflow from sample receipt to result reporting
2. **Quality Control**: Comprehensive QC procedures and documentation
3. **Sample Management**: Full sample tracking and storage management
4. **Critical Values**: Immediate notification system for critical results
5. **Instrument Integration**: Support for automated analyzer integration
6. **Compliance**: All activities logged for regulatory compliance
7. **Turnaround Time**: Real-time tracking of processing times
8. **Result Validation**: Multi-level review and validation process

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Lab Technician Operations