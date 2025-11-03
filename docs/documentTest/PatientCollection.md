# HealthPulse API - Patient Operations Collection

## 📋 Patient Collection Overview

This document provides detailed API documentation for all patient operations in the HealthPulse system. Patients can manage their profile, appointments, view consultations, prescriptions, and lab orders.

---

## 🔐 Authentication

### Patient Login
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "Patient@123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
    pm.environment.set("patient_id", response.data.user.id);
}
```

---

## 📁 6. Patient Operations

### 📂 My Profile

#### **View My Profile**
```http
GET {{base_url}}/api/v1/users/{{patient_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Patient profile retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('firstName');
    pm.expect(jsonData.data).to.have.property('lastName');
    pm.expect(jsonData.data).to.have.property('dateOfBirth');
    pm.expect(jsonData.data.role.name).to.equal('patient');
});
```

#### **Update My Profile**
```http
PUT {{base_url}}/api/v1/users/{{patient_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "1234567891",
  "address": "456 Updated Street, City, State 12345",
  "emergencyContact": {
    "name": "Updated Emergency Contact",
    "phone": "0987654322",
    "relationship": "Spouse"
  },
  "preferredLanguage": "English",
  "communicationPreferences": {
    "method": "email",
    "timePreference": "evening",
    "appointmentReminders": true,
    "labResultNotifications": true,
    "prescriptionAlerts": true
  },
  "medicalAlerts": ["Diabetes", "High Blood Pressure"],
  "pharmacyPreference": "{{preferred_pharmacy_id}}"
}
```

#### **Change Password**
```http
PUT {{base_url}}/api/v1/users/{{patient_id}}/password
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "Patient@123",
  "newPassword": "NewPatient@456",
  "confirmPassword": "NewPatient@456"
}
```

---

### 📂 My Appointments

#### **View Available Slots**
```http
GET {{base_url}}/api/v1/doctors/{{doctor_id}}/available-slots?date={{date}}&duration=30
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `date` (required): Preferred date (YYYY-MM-DD)
- `duration` (optional): Appointment duration in minutes (default: 30)
- `appointmentType` (optional): Type of appointment needed

**Test Script:**
```javascript
pm.test("Available slots returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('availableSlots');
    pm.expect(jsonData.data.availableSlots).to.be.an('array');
});
```

#### **Find Available Doctors**
```http
GET {{base_url}}/api/v1/doctors/available?date={{date}}&specialization={{specialization}}&location={{location}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `date` (required): Preferred date (YYYY-MM-DD)
- `specialization` (optional): Required specialization
- `location` (optional): Preferred location
- `language` (optional): Doctor's language preference
- `gender` (optional): Doctor's gender preference
- `rating` (optional): Minimum rating

#### **Book Appointment**
```http
POST {{base_url}}/api/v1/termins
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": "{{patient_id}}",
  "doctorId": "{{doctor_id}}",
  "appointmentDate": "2024-11-25",
  "appointmentTime": "10:30",
  "duration": 30,
  "type": "consultation",
  "reason": "Annual check-up and medication review",
  "priority": "normal",
  "symptoms": ["Fatigue", "Occasional headaches"],
  "preferredLanguage": "English",
  "notes": "Would like to discuss blood pressure medication",
  "requestedBy": "{{patient_id}}"
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("termin_id", response.data.id);
    pm.test("Appointment booked by patient", function () {
        pm.expect(response.data.patientId).to.equal(pm.environment.get("patient_id"));
    });
}
```

#### **View My Appointments**
```http
GET {{base_url}}/api/v1/termins/patient/{{patient_id}}?page=1&limit=10&status=upcoming
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (upcoming/completed/cancelled)
- `fromDate` (optional): Start date filter
- `toDate` (optional): End date filter
- `doctorId` (optional): Filter by specific doctor

#### **Get Appointment Details**
```http
GET {{base_url}}/api/v1/termins/{{termin_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Patient can only view own appointments", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.patientId).to.equal(pm.environment.get("patient_id"));
});
```

#### **Cancel My Appointment**
```http
PATCH {{base_url}}/api/v1/termins/{{termin_id}}/cancel
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Personal emergency, need to reschedule",
  "cancelledBy": "{{patient_id}}",
  "requestReschedule": true,
  "preferredNewDate": "2024-11-27",
  "notes": "Will call to reschedule for next week"
}
```

#### **Reschedule My Appointment**
```http
PATCH {{base_url}}/api/v1/termins/{{termin_id}}/reschedule
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "newDate": "2024-11-27",
  "newTime": "14:00",
  "reason": "Schedule conflict resolved",
  "rescheduledBy": "{{patient_id}}"
}
```

---

### 📂 My Consultations ✨ NEW

#### **View My Consultations**
```http
GET {{base_url}}/api/v1/consultations/patient/{{patient_id}}/history?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `fromDate` (optional): Start date for history
- `toDate` (optional): End date for history
- `doctorId` (optional): Filter by specific doctor
- `includeVitalSigns` (optional): Include vital signs data

**Test Script:**
```javascript
pm.test("Patient consultations retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('consultations');
    pm.expect(jsonData.data.consultations).to.be.an('array');
});
```

#### **Get Consultation Details**
```http
GET {{base_url}}/api/v1/consultations/{{consultation_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Patient can only view own consultations", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.patientId).to.equal(pm.environment.get("patient_id"));
});
```

#### **View My Medical History**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/medical-history
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `includeConsultations` (optional): Include consultation history (default: true)
- `includePrescriptions` (optional): Include prescription history (default: true)
- `includeLabOrders` (optional): Include lab order history (default: true)
- `includeVitalSigns` (optional): Include vital signs history (default: true)
- `fromDate` (optional): Start date for history
- `toDate` (optional): End date for history
- `summary` (optional): Return summarized view (default: false)

#### **View My Vital Signs History**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/vital-signs?limit=20
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `limit` (optional): Number of records to retrieve
- `fromDate` (optional): Start date for history
- `toDate` (optional): End date for history
- `chartFormat` (optional): Return data formatted for charts

---

### 📂 My Prescriptions ✨ NEW

---

#### **1️⃣ View All My Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/prescriptions`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Optional Query Parameters (add to URL):**
- `?page=1&limit=10` - Pagination
- `?status=signed` - Filter by status (draft/signed/dispensed/cancelled)

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response contains prescriptions", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('object');
    
    // Save first prescription ID for later tests
    if (jsonData.data.prescriptions && jsonData.data.prescriptions.length > 0) {
        pm.environment.set("prescription_id", jsonData.data.prescriptions[0]._id);
        console.log("✅ Saved prescription_id:", jsonData.data.prescriptions[0]._id);
    }
});

pm.test("Prescriptions belong to patient", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.prescriptions) {
        jsonData.data.prescriptions.forEach(prescription => {
            pm.expect(prescription.patientId).to.equal(pm.environment.get("patient_id"));
        });
    }
});

// Display results in console
console.log("Total Prescriptions:", pm.response.json().data.prescriptions?.length || 0);
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Prescriptions retrieved successfully",
  "data": {
    "prescriptions": [
      {
        "_id": "6907...",
        "orderNumber": "RX-2025-123456",
        "consultationId": "6907...",
        "patientId": "6907...",
        "doctorId": "6907...",
        "medications": [...],
        "status": "signed",
        "createdAt": "2025-11-03T...",
        "validUntil": "2026-02-01T..."
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

#### **2️⃣ View My Active Prescriptions (Alternative)**
```http
GET {{base_url}}/api/v1/prescriptions/my-prescriptions
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/prescriptions/my-prescriptions`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Only active prescriptions returned", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.prescriptions) {
        jsonData.data.prescriptions.forEach(prescription => {
            pm.expect(prescription.status).to.be.oneOf(['signed', 'dispensed']);
        });
    }
});

console.log("Active Prescriptions:", pm.response.json().data.prescriptions?.length || 0);
```

---

#### **3️⃣ Get Specific Prescription Details**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/prescriptions/{{prescription_id}}`
   - Make sure `prescription_id` is set in your environment variables
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Prescription details retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('orderNumber');
    pm.expect(jsonData.data).to.have.property('medications');
    pm.expect(jsonData.data).to.have.property('status');
});

pm.test("Patient can only view own prescription", function () {
    const jsonData = pm.response.json();
    const patientId = jsonData.data.patientId._id || jsonData.data.patientId;
    pm.expect(patientId).to.equal(pm.environment.get("patient_id"));
});

pm.test("Medications array exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.medications).to.be.an('array');
    pm.expect(jsonData.data.medications.length).to.be.at.least(1);
});

// Display prescription info
const prescription = pm.response.json().data;
console.log("Prescription Order Number:", prescription.orderNumber);
console.log("Status:", prescription.status);
console.log("Medications Count:", prescription.medications?.length || 0);
console.log("Valid Until:", prescription.validUntil);
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Prescription retrieved successfully",
  "data": {
    "_id": "6907...",
    "orderNumber": "RX-2025-123456",
    "consultationId": {
      "_id": "6907...",
      "chiefComplaint": "Headache"
    },
    "patientId": {
      "_id": "6907...",
      "fname": "John",
      "lname": "Doe"
    },
    "doctorId": {
      "_id": "6907...",
      "fname": "Dr. Smith",
      "specialization": "Cardiology"
    },
    "medications": [
      {
        "_id": "6907...",
        "medicationName": "Ibuprofen 400mg",
        "dosage": "400mg",
        "frequency": "3 times daily",
        "duration": {
          "value": 7,
          "unit": "days"
        },
        "instructions": "Take with food"
      }
    ],
    "status": "signed",
    "validUntil": "2026-02-01T...",
    "doctorNotes": "Patient should avoid alcohol",
    "createdAt": "2025-11-03T..."
  }
}
```

---

#### **4️⃣ Track Prescription Status**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}/status
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/prescriptions/{{prescription_id}}/status`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Status information available", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('currentStatus');
    pm.expect(jsonData.data).to.have.property('prescription');
});

pm.test("Current status is valid", function () {
    const jsonData = pm.response.json();
    const validStatuses = ['draft', 'signed', 'dispensed', 'cancelled'];
    pm.expect(validStatuses).to.include(jsonData.data.currentStatus);
});

pm.test("Status history exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.prescription).to.have.property('statusHistory');
    pm.expect(jsonData.data.prescription.statusHistory).to.be.an('array');
});

// Display status tracking
const data = pm.response.json().data;
console.log("Current Status:", data.currentStatus);
console.log("Order Number:", data.prescription.orderNumber);
console.log("Status Changes:", data.prescription.statusHistory?.length || 0);
if (data.pharmacy) {
    console.log("Assigned Pharmacy:", data.pharmacy.name);
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Prescription status retrieved successfully",
  "data": {
    "currentStatus": "signed",
    "prescription": {
      "_id": "6907...",
      "orderNumber": "RX-2025-123456",
      "status": "signed",
      "statusHistory": [
        {
          "status": "draft",
          "timestamp": "2025-11-03T10:00:00Z",
          "changedBy": "6907..."
        },
        {
          "status": "signed",
          "timestamp": "2025-11-03T10:30:00Z",
          "changedBy": "6907..."
        }
      ],
      "validUntil": "2026-02-01T...",
      "createdAt": "2025-11-03T..."
    },
    "doctor": {
      "fname": "Dr. Smith",
      "specialization": "Cardiology"
    },
    "pharmacy": null
  }
}
```

---

### 🎯 **Quick Test Checklist for Patient Prescriptions**

Copy this checklist to test all endpoints:

**Prerequisites:**
- ✅ Login as patient and save `access_token` and `patient_id`
- ✅ Have at least one prescription created by a doctor

**Test Sequence:**

1. **GET All Prescriptions** ✅
   - URL: `{{base_url}}/api/v1/prescriptions`
   - Should return list of your prescriptions
   - Save `prescription_id` from response

2. **GET My Prescriptions (Alternative)** ✅
   - URL: `{{base_url}}/api/v1/prescriptions/my-prescriptions`
   - Should return same prescriptions

3. **GET Prescription Details** ✅
   - URL: `{{base_url}}/api/v1/prescriptions/{{prescription_id}}`
   - Should show full details with medications

4. **GET Prescription Status** ✅
   - URL: `{{base_url}}/api/v1/prescriptions/{{prescription_id}}/status`
   - Should show current status and history

---

### 🔍 **Common Issues & Solutions**

**Issue 1: "Patient can only view own prescriptions"**
- **Solution**: Make sure you're logged in as a patient and using the correct `access_token`

**Issue 2: "Prescription not found"**
- **Solution**: Check that `prescription_id` is set correctly in environment variables
- **Solution**: Make sure the prescription belongs to the logged-in patient

**Issue 3: Empty prescriptions array**
- **Solution**: Ask a doctor to create a prescription for your patient account first

**Issue 4: 401 Unauthorized**
- **Solution**: Login again to get a fresh `access_token`
- **Solution**: Make sure Authorization header is set: `Bearer {{access_token}}`

---

### 📊 **Sample Test Flow in Postman**

```javascript
// 1. Login as Patient (POST /api/v1/auth/login)
// Save access_token and patient_id in Tests tab:
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("patient_id", response.data.user.id);
    console.log("✅ Patient logged in successfully");
}

// 2. Get All Prescriptions (GET /api/v1/prescriptions)
// Save first prescription_id in Tests tab:
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data.prescriptions && response.data.prescriptions.length > 0) {
        pm.environment.set("prescription_id", response.data.prescriptions[0]._id);
        console.log("✅ Prescription ID saved:", response.data.prescriptions[0]._id);
    }
}

// 3. Get Prescription Details (GET /api/v1/prescriptions/{{prescription_id}})
// View full prescription information

// 4. Track Status (GET /api/v1/prescriptions/{{prescription_id}}/status)
// Monitor prescription lifecycle
```

---

### 📂 My Lab Orders ✨ NEW

---

#### **1️⃣ View All My Lab Orders**
```http
GET {{base_url}}/api/v1/lab-orders
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/lab-orders`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Optional Query Parameters (add to URL):**
- `?page=1&limit=10` - Pagination
- `?status=pending` - Filter by status (pending/sample_collected/in_progress/completed)
- `?patientId={{patient_id}}` - Filter by patient (automatically filtered for patients)
- `?urgency=routine` - Filter by urgency (routine/urgent/stat)

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response contains lab orders", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('object');
    
    // Save first lab order ID for later tests
    if (jsonData.data.labOrders && jsonData.data.labOrders.length > 0) {
        pm.environment.set("lab_order_id", jsonData.data.labOrders[0]._id);
        console.log("✅ Saved lab_order_id:", jsonData.data.labOrders[0]._id);
    }
});

pm.test("Lab orders belong to patient", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.labOrders) {
        jsonData.data.labOrders.forEach(order => {
            const patientId = order.patientId._id || order.patientId;
            pm.expect(patientId).to.equal(pm.environment.get("patient_id"));
        });
    }
});

// Display results in console
const data = pm.response.json().data;
console.log("Total Lab Orders:", data.labOrders?.length || 0);
if (data.labOrders && data.labOrders.length > 0) {
    console.log("First Order Number:", data.labOrders[0].orderNumber);
    console.log("Status:", data.labOrders[0].status);
    console.log("Tests Count:", data.labOrders[0].tests?.length || 0);
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lab orders retrieved successfully",
  "data": {
    "labOrders": [
      {
        "_id": "6907...",
        "orderNumber": "LAB-2025-123456",
        "consultationId": "6907...",
        "patientId": {
          "_id": "6907...",
          "fname": "John",
          "lname": "Doe"
        },
        "doctorId": {
          "_id": "6907...",
          "fname": "Dr. Smith",
          "specialization": "Cardiology"
        },
        "laboratoryId": {
          "_id": "6907...",
          "name": "Central Lab"
        },
        "tests": [
          {
            "_id": "6907...",
            "name": "Complete Blood Count",
            "code": "CBC",
            "category": "Hematology",
            "status": "completed"
          }
        ],
        "status": "completed",
        "urgency": "routine",
        "createdAt": "2025-11-03T...",
        "estimatedCompletionDate": "2025-11-05T..."
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "pages": 1
    }
  }
}
```

---

#### **2️⃣ Get Lab Order Details**
```http
GET {{base_url}}/api/v1/lab-orders/{{lab_order_id}}
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}`
   - Make sure `lab_order_id` is set in your environment variables
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Lab order details retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('orderNumber');
    pm.expect(jsonData.data).to.have.property('tests');
    pm.expect(jsonData.data).to.have.property('status');
    pm.expect(jsonData.data).to.have.property('clinicalIndication');
});

pm.test("Patient can only view own lab order", function () {
    const jsonData = pm.response.json();
    const patientId = jsonData.data.patientId._id || jsonData.data.patientId;
    pm.expect(patientId).to.equal(pm.environment.get("patient_id"));
});

pm.test("Tests array exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.tests).to.be.an('array');
    pm.expect(jsonData.data.tests.length).to.be.at.least(1);
});

pm.test("Laboratory info included", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('laboratoryId');
    if (jsonData.data.laboratoryId.name) {
        pm.expect(jsonData.data.laboratoryId.name).to.be.a('string');
    }
});

// Display lab order info
const order = pm.response.json().data;
console.log("Order Number:", order.orderNumber);
console.log("Status:", order.status);
console.log("Urgency:", order.urgency);
console.log("Tests Count:", order.tests?.length || 0);
console.log("Laboratory:", order.laboratoryId?.name || "N/A");
console.log("Clinical Indication:", order.clinicalIndication);

// List all tests
if (order.tests) {
    console.log("\nTests Ordered:");
    order.tests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.name} (${test.code}) - Status: ${test.status}`);
    });
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lab order retrieved successfully",
  "data": {
    "_id": "6907...",
    "orderNumber": "LAB-2025-123456",
    "consultationId": {
      "_id": "6907...",
      "chiefComplaint": "Headache and fatigue"
    },
    "patientId": {
      "_id": "6907...",
      "fname": "John",
      "lname": "Doe",
      "dateOfBirth": "1990-01-15"
    },
    "doctorId": {
      "_id": "6907...",
      "fname": "Dr. Smith",
      "specialization": "Cardiology"
    },
    "laboratoryId": {
      "_id": "6907...",
      "name": "Central Laboratory",
      "address": "123 Medical Center",
      "phone": "555-0100"
    },
    "tests": [
      {
        "_id": "6907...",
        "name": "Complete Blood Count",
        "code": "CBC",
        "category": "Hematology",
        "status": "completed",
        "urgency": "routine",
        "instructions": "Fasting not required",
        "results": {
          "WBC": "7.5",
          "RBC": "5.2",
          "Hemoglobin": "15.0"
        },
        "interpretation": "All values within normal range"
      }
    ],
    "status": "completed",
    "urgency": "routine",
    "clinicalIndication": "Routine health check and headache workup",
    "notes": "Patient has history of hypertension",
    "fastingRequired": false,
    "estimatedCompletionDate": "2025-11-05T...",
    "completedDate": "2025-11-04T...",
    "createdAt": "2025-11-03T..."
  }
}
```

---

#### **3️⃣ View Lab Results**
```http
GET {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Optional Query Parameters (add to URL):**
- `?format=detailed` - Result format (detailed/summary)
- `?includeReference=true` - Include reference ranges
- `?includeTrends=true` - Include historical trends

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Lab results retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('orderNumber');
    pm.expect(jsonData.data).to.have.property('completedTests');
});

pm.test("Lab results contain test data", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.completedTests) {
        pm.expect(jsonData.data.completedTests).to.be.an('array');
        
        // Check if results have data
        jsonData.data.completedTests.forEach(test => {
            pm.expect(test).to.have.property('name');
            pm.expect(test).to.have.property('status');
            if (test.status === 'completed') {
                pm.expect(test).to.have.property('results');
            }
        });
    }
});

pm.test("Completion date exists for completed tests", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.status === 'completed') {
        pm.expect(jsonData.data).to.have.property('completedDate');
    }
});

pm.test("Critical values flagged if present", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.completedTests) {
        jsonData.data.completedTests.forEach(test => {
            if (test.criticalValues && test.criticalValues.length > 0) {
                console.log("⚠️ CRITICAL VALUES FOUND:", test.name);
                test.criticalValues.forEach(cv => {
                    console.log(`  - ${cv.parameter}: ${cv.value} (${cv.flag})`);
                });
            }
        });
    }
});

// Display lab results
const data = pm.response.json().data;
console.log("\n📋 Lab Results Summary");
console.log("=====================");
console.log("Order Number:", data.orderNumber);
console.log("Status:", data.status);
console.log("Completed Date:", data.completedDate || "Pending");
console.log("\nCompleted Tests:", data.completedTests?.length || 0);
console.log("Pending Tests:", data.pendingTests?.length || 0);

// Display individual test results
if (data.completedTests && data.completedTests.length > 0) {
    console.log("\n📊 Test Results:");
    data.completedTests.forEach((test, index) => {
        console.log(`\n${index + 1}. ${test.name} (${test.code})`);
        console.log("   Category:", test.category);
        console.log("   Status:", test.status);
        if (test.results) {
            console.log("   Results:", JSON.stringify(test.results, null, 2));
        }
        if (test.interpretation) {
            console.log("   Interpretation:", test.interpretation);
        }
    });
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lab results retrieved successfully",
  "data": {
    "orderNumber": "LAB-2025-123456",
    "patientId": "6907...",
    "status": "completed",
    "completedDate": "2025-11-04T14:30:00Z",
    "completedTests": [
      {
        "_id": "6907...",
        "name": "Complete Blood Count",
        "code": "CBC",
        "category": "Hematology",
        "status": "completed",
        "results": {
          "WBC": "7.5 x10^9/L",
          "RBC": "5.2 x10^12/L",
          "Hemoglobin": "15.0 g/dL",
          "Hematocrit": "45.0%",
          "Platelets": "250 x10^9/L"
        },
        "referenceRanges": {
          "WBC": "4.0-11.0 x10^9/L",
          "RBC": "4.5-5.9 x10^12/L",
          "Hemoglobin": "13.5-17.5 g/dL"
        },
        "interpretation": "All values within normal range. No abnormalities detected.",
        "resultNotes": "Good overall blood cell counts",
        "performedBy": "Lab Technician Smith",
        "completedAt": "2025-11-04T14:30:00Z"
      },
      {
        "_id": "6907...",
        "name": "Basic Metabolic Panel",
        "code": "BMP",
        "category": "Chemistry",
        "status": "completed",
        "results": {
          "Glucose": "95 mg/dL",
          "Sodium": "140 mEq/L",
          "Potassium": "4.2 mEq/L",
          "Chloride": "102 mEq/L",
          "CO2": "24 mEq/L",
          "BUN": "15 mg/dL",
          "Creatinine": "1.0 mg/dL"
        },
        "interpretation": "Normal kidney function and electrolyte balance.",
        "criticalValues": [],
        "completedAt": "2025-11-04T14:45:00Z"
      }
    ],
    "pendingTests": [],
    "laboratory": {
      "name": "Central Laboratory",
      "phone": "555-0100"
    },
    "doctor": {
      "fname": "Dr. Smith",
      "specialization": "Cardiology"
    }
  }
}
```

---

### 🎯 **Quick Test Checklist for Patient Lab Orders**

Copy this checklist to test all endpoints:

**Prerequisites:**
- ✅ Login as patient and save `access_token` and `patient_id`
- ✅ Have at least one lab order created by a doctor

**Test Sequence:**

1. **GET All Lab Orders** ✅
   - URL: `{{base_url}}/api/v1/lab-orders`
   - Should return list of your lab orders
   - Save `lab_order_id` from response

2. **GET Lab Order Details** ✅
   - URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}`
   - Should show full details with all tests

3. **GET Lab Results** ✅
   - URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results`
   - Should show completed results and pending tests
   - **Note**: Only works if status is `completed` or `partial_results`

---

### 🔍 **Common Issues & Solutions**

**Issue 1: "Patient can only view own lab orders"**
- **Solution**: Make sure you're logged in as a patient and using the correct `access_token`

**Issue 2: "Lab order not found"**
- **Solution**: Check that `lab_order_id` is set correctly in environment variables
- **Solution**: Make sure the lab order belongs to the logged-in patient

**Issue 3: Empty lab orders array**
- **Solution**: Ask a doctor to create a lab order for your patient account first

**Issue 4: No results available**
- **Solution**: Lab results are only available when status is `completed` or `partial_results`
- **Solution**: Wait for lab technician to process and add results

**Issue 5: 403 Forbidden on results**
- **Solution**: Patients can only view results for orders where they are the patient
- **Solution**: Make sure the lab order status allows viewing results

---

### 📊 **Sample Test Flow in Postman**

```javascript
// 1. Login as Patient (POST /api/v1/auth/login)
// Save access_token and patient_id in Tests tab:
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("patient_id", response.data.user.id);
    console.log("✅ Patient logged in successfully");
}

// 2. Get All Lab Orders (GET /api/v1/lab-orders)
// Save first lab_order_id in Tests tab:
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data.labOrders && response.data.labOrders.length > 0) {
        pm.environment.set("lab_order_id", response.data.labOrders[0]._id);
        console.log("✅ Lab Order ID saved:", response.data.labOrders[0]._id);
        console.log("   Status:", response.data.labOrders[0].status);
    }
}

// 3. Get Lab Order Details (GET /api/v1/lab-orders/{{lab_order_id}})
// View full lab order information

// 4. Get Lab Results (GET /api/v1/lab-orders/{{lab_order_id}}/results)
// View completed test results (only if status is completed)
if (pm.response.code === 200) {
    const response = pm.response.json();
    console.log("✅ Results Status:", response.data.status);
    console.log("   Completed Tests:", response.data.completedTests?.length || 0);
    console.log("   Pending Tests:", response.data.pendingTests?.length || 0);
}
```

---

### 🔬 **Understanding Lab Order Status**

| Status | Description | Can View Results? |
|--------|-------------|-------------------|
| `pending` | Order created, awaiting sample collection | ❌ No |
| `sample_collected` | Sample collected, sent to lab | ❌ No |
| `in_progress` | Lab is processing tests | ❌ No |
| `partial_results` | Some tests completed | ✅ Yes (partial) |
| `completed` | All tests completed | ✅ Yes (full) |
| `cancelled` | Order cancelled | ❌ No |

---

### 🏥 **Lab Result Interpretation Guide**

**Normal Result:**
- All values within reference ranges
- No critical values flagged
- Interpretation: "Normal" or "Within normal limits"

**Abnormal Result:**
- Values outside reference ranges
- May have critical values flagged
- Doctor consultation recommended

**Critical Values:**
- Marked with ⚠️ warning
- Requires immediate medical attention
- Doctor will be notified automatically

---

### 📂 Patient Health Dashboard (Patient-specific)

#### **Get Health Summary**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/health-summary
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Health summary includes key metrics", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('recentVitalSigns');
    pm.expect(jsonData.data).to.have.property('activePrescriptions');
    pm.expect(jsonData.data).to.have.property('upcomingAppointments');
});
```

#### **Get Medication Reminders**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/medication-reminders
Authorization: Bearer {{access_token}}
```

#### **Update Health Goals**
```http
PUT {{base_url}}/api/v1/patients/{{patient_id}}/health-goals
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "weightGoal": 70,
  "bloodPressureGoal": "120/80",
  "exerciseGoal": "30 minutes daily",
  "dietaryRestrictions": ["Low sodium", "Diabetic"],
  "healthPriorities": ["Weight management", "Blood pressure control"],
  "medicationAdherence": true
}
```

---

### 📂 Patient Communication (Patient-specific)

#### **Send Message to Doctor**
```http
POST {{base_url}}/api/v1/patients/{{patient_id}}/messages
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipientId": "{{doctor_id}}",
  "subject": "Question about medication side effects",
  "message": "I've been experiencing some mild nausea since starting the new medication. Is this normal?",
  "priority": "normal",
  "requestResponse": true
}
```

#### **View My Messages**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/messages?page=1&limit=10
Authorization: Bearer {{access_token}}
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

### Patient-specific Tests
```javascript
pm.test("Patient has required permissions", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.user) {
        pm.expect(jsonData.data.user.role.name).to.equal('patient');
    }
});

pm.test("Data belongs to authenticated patient", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.patientId) {
        pm.expect(jsonData.data.patientId).to.equal(pm.environment.get("patient_id"));
    }
});
```

### Privacy Tests
```javascript
pm.test("Patient can only access own data", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.patientId || jsonData.data.patient) {
        const patientId = jsonData.data.patientId || jsonData.data.patient.id;
        pm.expect(patientId).to.equal(pm.environment.get("patient_id"));
    }
});
```

### Health Data Tests
```javascript
pm.test("Health data includes required fields", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.vitalSigns) {
        pm.expect(jsonData.data.vitalSigns).to.have.property('recordedAt');
    }
    if (jsonData.data.prescription) {
        pm.expect(jsonData.data.prescription).to.have.property('medications');
    }
});
```

---

## 🔧 Environment Variables

Required variables for patient operations:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "patient_id": "",
  "doctor_id": "",
  "termin_id": "",
  "consultation_id": "",
  "prescription_id": "",
  "lab_order_id": "",
  "pharmacy_id": "",
  "message_id": "",
  "preferred_pharmacy_id": ""
}
```

---

## 📝 Notes

1. **Privacy**: Patients can only access their own data
2. **Appointments**: Full booking and management capabilities
3. **Health Records**: Comprehensive access to medical history
4. **Prescriptions**: Real-time tracking and status updates
5. **Lab Results**: Secure access to test results with explanations
6. **Communication**: Direct messaging with healthcare providers
7. **Health Management**: Tools for tracking health goals and medication adherence

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Patient Operations