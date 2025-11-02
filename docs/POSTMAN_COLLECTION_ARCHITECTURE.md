# HealthPulse API - Postman Collection Architecture

## 📋 Complete Collection Structure

```
HealthPulse API/
│
├── 📁 Environment Setup
│   ├── Get Role IDs (helper)
│   └── Environment Variables Documentation
│
├── 📁 1. Authentication
│   ├── Login Admin
│   ├── Login Doctor
│   ├── Login Nurse
│   ├── Login Reception
│   ├── Login Patient
│   ├── Login Pharmacist ✨ NEW
│   ├── Login Lab Technician ✨ NEW
│   ├── Refresh Token
│   ├── Logout
│   ├── Forgot Password
│   └── Reset Password
│
├── 📁 2. Admin Operations
│   ├── 📂 User Management
│   │   ├── Create Doctor Account
│   │   ├── Create Nurse Account
│   │   ├── Create Reception Account
│   │   ├── Create Patient Account
│   │   ├── Create Pharmacist Account ✨ NEW
│   │   ├── Create Lab Technician Account ✨ NEW
│   │   ├── List All Users
│   │   ├── Get User Details
│   │   ├── Update User
│   │   ├── Suspend User
│   │   ├── Activate User
│   │   └── Delete User
│   │
│   ├── 📂 Role Management
│   │   ├── List All Roles
│   │   ├── Get Role Details
│   │   ├── Update Role Permissions
│   │   └── Create Custom Role
│   │
│   ├── 📂 Pharmacy Management ✨ NEW
│   │   ├── Register Partner Pharmacy
│   │   ├── List All Pharmacies
│   │   ├── Get Pharmacy Details
│   │   ├── Update Pharmacy Info
│   │   ├── Activate Pharmacy
│   │   ├── Suspend Pharmacy
│   │   └── Delete Pharmacy
│   │
│   ├── 📂 Laboratory Management ✨ NEW
│   │   ├── Register Partner Laboratory
│   │   ├── List All Laboratories
│   │   ├── Get Laboratory Details
│   │   ├── Update Laboratory Info
│   │   ├── Activate Laboratory
│   │   ├── Suspend Laboratory
│   │   └── Delete Laboratory
│   │
│   └── 📂 System Overview
│       ├── View All Patients
│       ├── View All Appointments
│       ├── View All Consultations ✨ NEW
│       ├── View All Prescriptions ✨ NEW
│       ├── View All Lab Orders ✨ NEW
│       └── System Statistics
│
├── 📁 3. Doctor Operations
│   ├── 📂 My Schedule
│   │   ├── View Today's Appointments
│   │   ├── View Weekly Schedule
│   │   ├── Check My Availability
│   │   └── View Upcoming Appointments
│   │
│   ├── 📂 My Patients
│   │   ├── Create Patient
│   │   ├── List My Patients
│   │   ├── View Patient Details
│   │   ├── View Patient Medical History ✨ NEW
│   │   ├── Update Patient Info
│   │   └── Search Patients
│   │
│   ├── 📂 Appointments
│   │   ├── View My Appointments
│   │   ├── Get Appointment Details
│   │   ├── Complete Appointment
│   │   └── Cancel Appointment
│   │
│   ├── 📂 Consultations ✨ NEW
│   │   ├── Create Consultation
│   │   ├── List My Consultations
│   │   ├── Get Consultation Details
│   │   ├── Update Consultation
│   │   ├── Add Vital Signs
│   │   ├── Add Diagnosis
│   │   ├── Complete Consultation
│   │   └── Get Patient Consultation History
│   │
│   ├── 📂 Prescriptions ✨ NEW
│   │   ├── Create Prescription
│   │   ├── Add Medication to Prescription (PUT)
│   │   ├── List My Prescriptions
│   │   ├── Get Prescription Details
│   │   ├── Update Prescription (Draft only)
│   │   ├── Sign Prescription
│   │   ├── Assign to Pharmacy
│   │   ├── View Prescription Status
│   │   └── Cancel Prescription
│   │
│   ├── 📂 Lab Orders ✨ NEW
│   │   ├── Create Lab Order
│   │   ├── Add Tests to Order (PUT)
│   │   ├── List My Lab Orders
│   │   ├── Get Lab Order Details
│   │   ├── View Lab Results
│   │   └── Cancel Lab Order
│   │
│   └── 📂 My Profile
│       ├── View My Profile
│       ├── Update My Profile
│       └── Change Password
│
├── 📁 4. Nurse Operations
│   ├── 📂 Patient Management
│   │   ├── Create Patient
│   │   ├── View All Patients
│   │   ├── Get Patient Details
│   │   ├── Update Patient Info
│   │   └── Search Patients
│   │
│   ├── 📂 Appointment Management
│   │   ├── Create Appointment
│   │   ├── View All Appointments
│   │   ├── Get Appointment Details
│   │   └── Update Appointment
│   │
│   ├── 📂 Consultations ✨ NEW
│   │   ├── View All Consultations
│   │   ├── Get Consultation Details
│   │   └── View Patient History
│   │
│   └── 📂 My Profile
│       ├── View My Profile
│       ├── Update My Profile
│       └── Change Password
│
├── 📁 5. Reception Operations
│   ├── 📂 Patient Registration
│   │   ├── Create Patient
│   │   ├── Search Patients
│   │   ├── Get Patient Details
│   │   └── Update Patient Info
│   │
│   ├── 📂 Appointment Scheduling
│   │   ├── Check Doctor Availability
│   │   ├── Find Available Doctors
│   │   ├── Create Appointment
│   │   ├── View All Appointments
│   │   ├── Get Appointment Details
│   │   ├── Cancel Appointment
│   │   └── Reschedule Appointment
│   │
│   ├── 📂 Partner Services ✨ NEW
│   │   ├── Search Nearby Pharmacies
│   │   ├── Get Pharmacy Details
│   │   ├── Search Nearby Laboratories
│   │   └── Get Laboratory Details
│   │
│   └── 📂 My Profile
│       ├── View My Profile
│       ├── Update My Profile
│       └── Change Password
│
├── 📁 6. Patient Operations
│   ├── 📂 My Profile
│   │   ├── View My Profile
│   │   ├── Update My Profile
│   │   └── Change Password
│   │
│   ├── 📂 My Appointments
│   │   ├── View Available Slots
│   │   ├── Find Available Doctors
│   │   ├── Book Appointment
│   │   ├── View My Appointments
│   │   ├── Get Appointment Details
│   │   ├── Cancel My Appointment
│   │   └── Reschedule My Appointment
│   │
│   ├── 📂 My Consultations ✨ NEW
│   │   ├── View My Consultations
│   │   ├── Get Consultation Details
│   │   ├── View My Medical History
│   │   └── View My Vital Signs History
│   │
│   ├── 📂 My Prescriptions ✨ NEW
│   │   ├── View My Prescriptions
│   │   ├── View Active Prescriptions
│   │   ├── Get Prescription Details
│   │   └── Track Prescription Status
│   │
│   └── 📂 My Lab Orders ✨ NEW
│       ├── View My Lab Orders
│       ├── Get Lab Order Details
│       └── View Lab Results
│
├── 📁 7. Pharmacist Operations ✨ NEW
│   ├── 📂 Authentication
│   │   ├── Pharmacist Login
│   │   └── View My Pharmacy Info
│   │
│   ├── 📂 Prescription Management
│   │   ├── View Assigned Prescriptions
│   │   ├── View Pending Prescriptions
│   │   ├── Get Prescription Details
│   │   ├── Update Prescription Status
│   │   │   ├── Mark as In Preparation
│   │   │   └── Mark as Dispensed
│   │   ├── Report Medication Unavailable
│   │   └── View Dispensing History
│   │
│   └── 📂 My Profile
│       ├── View My Profile
│       ├── Update My Profile
│       └── Change Password
│
└── 📁 8. Lab Technician Operations ✨ NEW
    ├── 📂 Authentication
    │   ├── Lab Technician Login
    │   └── View My Laboratory Info
    │
    ├── 📂 Lab Order Management
    │   ├── View Pending Orders
    │   ├── View All Orders
    │   ├── Get Order Details
    │   ├── Update Order Status
    │   │   ├── Mark as In Progress
    │   │   ├── Mark as Completed
    │   │   └── Mark as Rejected
    │   ├── Add Lab Results
    │   ├── Search Orders
    │   └── View Order History
    │
    └── 📂 My Profile
        ├── View My Profile
        ├── Update My Profile
        └── Change Password
```

---

## 🔧 Environment Variables Setup

### Required Variables
```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "refresh_token": "",
  "admin_id": "",
  "doctor_id": "",
  "nurse_id": "",
  "reception_id": "",
  "patient_id": "",
  "pharmacist_id": "",
  "lab_technician_id": "",
  "pharmacy_id": "",
  "laboratory_id": "",
  "role_admin": "",
  "role_doctor": "",
  "role_nurse": "",
  "role_reception": "",
  "role_patient": "",
  "role_pharmacist": "",
  "role_lab_technician": ""
}
```

---

## 📝 Detailed Endpoint Documentation

### 1️⃣ Authentication Endpoints

#### **Login Admin**
```http
POST {{base_url}}/api/v1/auth/login
```
**Body:**
```json
{
  "email": "admin@healthpulse.com",
  "password": "Admin@123"
}
```
**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
    pm.environment.set("admin_id", response.data.user.id);
}
```

#### **Login Pharmacist** ✨ NEW
```http
POST {{base_url}}/api/v1/auth/login
```
**Body:**
```json
{
  "email": "pharmacist@healthpulse.com",
  "password": "Pharmacist@123"
}
```
**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("pharmacist_id", response.data.user.id);
}
```

#### **Login Lab Technician** ✨ NEW
```http
POST {{base_url}}/api/v1/auth/login
```
**Body:**
```json
{
  "email": "labtech@healthpulse.com",
  "password": "LabTech@123"
}
```

---

### 2️⃣ Admin Operations

#### **📂 Pharmacy Management** ✨ NEW

##### **Register Partner Pharmacy**
```http
POST {{base_url}}/api/v1/pharmacies
Authorization: Bearer {{access_token}}
```
**Body:**
```json
{
  "name": "MediCare Pharmacy",
  "licenseNumber": "PHR-2024-001",
  "address": "123 Main Street, City, State 12345",
  "phone": "1234567890",
  "email": "info@medicare-pharmacy.com",
  "emergencyPhone": "0987654321",
  "is24Hours": false,
  "workingHours": {
    "monday": {
      "open": "08:00",
      "close": "20:00",
      "isClosed": false
    },
    "tuesday": {
      "open": "08:00",
      "close": "20:00",
      "isClosed": false
    },
    "sunday": {
      "open": "00:00",
      "close": "00:00",
      "isClosed": true
    }
  }
}
```

##### **List All Pharmacies**
```http
GET {{base_url}}/api/v1/pharmacies?status=active&page=1&limit=10
Authorization: Bearer {{access_token}}
```

##### **Activate Pharmacy**
```http
PATCH {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/activate
Authorization: Bearer {{access_token}}
```

##### **Suspend Pharmacy**
```http
PATCH {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/suspend
Authorization: Bearer {{access_token}}
```
**Body:**
```json
{
  "reason": "License renewal pending"
}
```

---

### 3️⃣ Doctor Operations

#### **📂 Consultations** ✨ NEW

##### **Create Consultation**
```http
POST {{base_url}}/api/v1/consultations
Authorization: Bearer {{access_token}}
```
**Body:**
```json
{
  "terminId": "{{termin_id}}",
  "patientId": "{{patient_id}}",
  "chiefComplaint": "Persistent headache for 3 days",
  "symptoms": ["Headache", "Dizziness", "Nausea"],
  "vitalSigns": {
    "bloodPressure": "120/80",
    "temperature": 37.2,
    "pulse": 75,
    "respiratoryRate": 18,
    "weight": 70,
    "height": 175
  },
  "diagnosis": "Tension headache",
  "treatmentPlan": "Rest, hydration, and over-the-counter pain medication",
  "notes": "Patient advised to return if symptoms persist",
  "followUpDate": "2024-11-22"
}
```

##### **Get Patient Consultation History**
```http
GET {{base_url}}/api/v1/consultations/patient/{{patient_id}}/history
Authorization: Bearer {{access_token}}
```

#### **📂 Prescriptions** ✨ NEW

##### **Create Prescription**
```http
POST {{base_url}}/api/v1/prescriptions
Authorization: Bearer {{access_token}}
```
**Body:**
```json
{
  "consultationId": "{{consultation_id}}",
  "patientId": "{{patient_id}}",
  "medications": [
    {
      "name": "Ibuprofen 400mg",
      "dosage": "400mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take with food"
    }
  ],
  "notes": "Patient should avoid alcohol while taking medication"
}
```

##### **Add Medication to Prescription** (PUT)
```http
PUT {{base_url}}/api/v1/prescriptions/{{prescription_id}}/medications
Authorization: Bearer {{access_token}}
```
**Body:**
```json
{
  "name": "Paracetamol 500mg",
  "dosage": "500mg",
  "frequency": "As needed",
  "duration": "5 days",
  "instructions": "Do not exceed 4 doses per day"
}
```

##### **Sign Prescription**
```http
POST {{base_url}}/api/v1/prescriptions/{{prescription_id}}/sign
Authorization: Bearer {{access_token}}
```

##### **Assign to Pharmacy**
```http
POST {{base_url}}/api/v1/prescriptions/{{prescription_id}}/assign-pharmacy
Authorization: Bearer {{access_token}}
```
**Body:**
```json
{
  "pharmacyId": "{{pharmacy_id}}"
}
```

---

### 4️⃣ Nurse Operations

#### **📂 Consultations** ✨ NEW

##### **View All Consultations**
```http
GET {{base_url}}/api/v1/consultations?status=completed&page=1&limit=10
Authorization: Bearer {{access_token}}
```

##### **View Patient History**
```http
GET {{base_url}}/api/v1/consultations/patient/{{patient_id}}/history
Authorization: Bearer {{access_token}}
```

---

### 5️⃣ Reception Operations

#### **📂 Partner Services** ✨ NEW

##### **Search Nearby Pharmacies**
```http
GET {{base_url}}/api/v1/pharmacies/search?q=MediCare
Authorization: Bearer {{access_token}}
```

##### **Search Nearby Laboratories**
```http
GET {{base_url}}/api/v1/laboratories/search?q=Advanced
Authorization: Bearer {{access_token}}
```

---

### 6️⃣ Patient Operations

#### **📂 My Consultations** ✨ NEW

##### **View My Consultations**
```http
GET {{base_url}}/api/v1/consultations/patient/{{patient_id}}/history
Authorization: Bearer {{access_token}}
```

##### **View My Medical History**
```http
GET {{base_url}}/api/v1/consultations/patient/{{patient_id}}/history
Authorization: Bearer {{access_token}}
```

#### **📂 My Prescriptions** ✨ NEW

##### **View My Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions?patientId={{patient_id}}
Authorization: Bearer {{access_token}}
```

##### **View Active Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions?patientId={{patient_id}}&status=signed
Authorization: Bearer {{access_token}}
```

##### **Track Prescription Status**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}
Authorization: Bearer {{access_token}}
```

---

### 7️⃣ Pharmacist Operations ✨ NEW

#### **📂 Prescription Management**

##### **View Assigned Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions/pharmacy/{{pharmacy_id}}?status=signed
Authorization: Bearer {{access_token}}
```

##### **View Pending Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions/pharmacy/{{pharmacy_id}}?status=signed
Authorization: Bearer {{access_token}}
```

##### **Update Prescription Status**
```http
PATCH {{base_url}}/api/v1/prescriptions/{{prescription_id}}/status
Authorization: Bearer {{access_token}}
```
**Body (Mark as Dispensed):**
```json
{
  "status": "dispensed"
}
```

##### **View Dispensing History**
```http
GET {{base_url}}/api/v1/prescriptions/pharmacy/{{pharmacy_id}}?status=dispensed
Authorization: Bearer {{access_token}}
```

---

### 8️⃣ Lab Technician Operations ✨ NEW

#### **📂 Lab Order Management**

##### **View Pending Orders**
```http
GET {{base_url}}/api/v1/lab-orders?status=pending
Authorization: Bearer {{access_token}}
```

##### **View All Orders**
```http
GET {{base_url}}/api/v1/lab-orders
Authorization: Bearer {{access_token}}
```

##### **Get Order Details**
```http
GET {{base_url}}/api/v1/lab-orders/{{order_id}}
Authorization: Bearer {{access_token}}
```

---

## 🧪 Pre-request Scripts

### Auto Token Refresh
Add this to your collection's pre-request script:

```javascript
const accessToken = pm.environment.get("access_token");
const refreshToken = pm.environment.get("refresh_token");

if (!accessToken && refreshToken) {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/v1/auth/refresh",
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

---

## ✅ Test Scripts

### Common Success Test
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response has data field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});
```

---

## 🎯 Role-Based Testing Matrix

| Endpoint | Admin | Doctor | Nurse | Reception | Patient | Pharmacist | Lab Tech |
|----------|-------|--------|-------|-----------|---------|------------|----------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Patient CRUD | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ | ❌ |
| Appointments | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ | ❌ |
| Consultations | ✅ | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ❌ |
| Prescriptions | ✅ | ✅ | 👁️ | 👁️ | 👁️ | ✏️ | ❌ |
| Pharmacy Mgmt | ✅ | ❌ | ❌ | ❌ | ❌ | 👁️ | ❌ |
| Lab Orders | ✅ | ✅ | 👁️ | 👁️ | 👁️ | ❌ | ✏️ |

**Legend:**
- ✅ Full access
- 👁️ Read-only
- ✏️ Limited update
- ❌ No access

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Base URL:** http://localhost:3000
