# HealthPulse API - Nurse Operations Collection

## 📋 Nurse Collection Overview

This document provides detailed API documentation for all nurse operations in the HealthPulse system. Nurses can manage patients, appointments, view consultations, and handle their profile.

---

## 🔐 Authentication

### Nurse Login
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "nurse@healthpulse.com",
  "password": "Nurse@123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
    pm.environment.set("nurse_id", response.data.user.id);
}
```

---

## 📁 4. Nurse Operations

### 📂 Patient Management

#### **Create Patient**
```http
POST {{base_url}}/api/v1/patients
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@email.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-08-20",
  "gender": "Female",
  "address": "456 Oak Avenue, City, State 12345",
  "emergencyContact": {
    "name": "Robert Johnson",
    "phone": "0987654321",
    "relationship": "Husband"
  },
  "bloodType": "B+",
  "allergies": ["Latex", "Aspirin"],
  "medicalHistory": ["Asthma", "Seasonal Allergies"],
  "insurance": {
    "provider": "MediCare Insurance",
    "policyNumber": "MC987654321",
    "groupNumber": "GRP002"
  },
  "admissionReason": "Routine check-up",
  "referredBy": "Dr. Smith"
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("patient_id", response.data.id);
    pm.test("Patient created by nurse", function () {
        pm.expect(response.data.createdBy).to.equal(pm.environment.get("nurse_id"));
    });
}
```

#### **View All Patients**
```http
GET {{base_url}}/api/v1/patients?page=1&limit=10&status=active
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (active/inactive)
- `search` (optional): Search by name, email, or phone
- `bloodType` (optional): Filter by blood type
- `gender` (optional): Filter by gender
- `ward` (optional): Filter by hospital ward
- `admissionDate` (optional): Filter by admission date

#### **Get Patient Details**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Patient details retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data).to.have.property('firstName');
    pm.expect(jsonData.data).to.have.property('medicalHistory');
});
```

#### **Update Patient Info**
```http
PUT {{base_url}}/api/v1/patients/{{patient_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "1234567891",
  "address": "789 Pine Street, City, State 12345",
  "emergencyContact": {
    "name": "Robert Johnson",
    "phone": "0987654322",
    "relationship": "Husband"
  },
  "allergies": ["Latex", "Aspirin", "Penicillin"],
  "medicalHistory": ["Asthma", "Seasonal Allergies", "Migraine"],
  "currentMedications": [
    {
      "name": "Albuterol Inhaler",
      "dosage": "2 puffs",
      "frequency": "As needed"
    }
  ],
  "vitalSigns": {
    "bloodPressure": "118/75",
    "temperature": 36.7,
    "pulse": 68,
    "weight": 65,
    "height": 165
  }
}
```

#### **Search Patients**
```http
GET {{base_url}}/api/v1/patients/search?q={{search_term}}&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `q` (required): Search term (name, email, phone, patient ID)
- `limit` (optional): Number of results (default: 10)
- `includeInactive` (optional): Include inactive patients (default: false)

---

### 📂 Appointment Management

#### **Create Appointment**
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
  "reason": "Follow-up for asthma management",
  "priority": "normal",
  "department": "Internal Medicine",
  "notes": "Patient reports improved breathing but occasional wheezing",
  "createdBy": "{{nurse_id}}",
  "patientInstructions": "Please bring all current medications and inhaler"
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("termin_id", response.data.id);
    pm.test("Appointment created by nurse", function () {
        pm.expect(response.data.createdBy).to.equal(pm.environment.get("nurse_id"));
    });
}
```

#### **View All Appointments**
```http
GET {{base_url}}/api/v1/termins?page=1&limit=10&status=confirmed
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending/confirmed/completed/cancelled)
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `department` (optional): Filter by department
- `type` (optional): Filter by appointment type

#### **Get Appointment Details**
```http
GET {{base_url}}/api/v1/termins/{{termin_id}}
Authorization: Bearer {{access_token}}
```

#### **Update Appointment**
```http
PUT {{base_url}}/api/v1/termins/{{termin_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentDate": "2024-11-26",
  "appointmentTime": "11:00",
  "reason": "Updated: Follow-up for asthma management and medication review",
  "notes": "Patient requested schedule change due to work conflict",
  "patientInstructions": "Please bring all current medications, inhaler, and recent lung function test results"
}
```

**Test Script:**
```javascript
pm.test("Appointment updated successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.updatedBy).to.equal(pm.environment.get("nurse_id"));
});
```

---

### 📂 Consultations ✨ NEW

#### **View All Consultations**
```http
GET {{base_url}}/api/v1/consultations?page=1&limit=10&status=completed
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (in_progress/completed)
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `date` (optional): Filter by consultation date (YYYY-MM-DD)
- `department` (optional): Filter by department

**Test Script:**
```javascript
pm.test("Nurse can view consultations", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('consultations');
});
```

#### **Get Consultation Details**
```http
GET {{base_url}}/api/v1/consultations/{{consultation_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Consultation details include vital signs", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.vitalSigns) {
        pm.expect(jsonData.data.vitalSigns).to.have.property('bloodPressure');
        pm.expect(jsonData.data.vitalSigns).to.have.property('temperature');
        pm.expect(jsonData.data.vitalSigns).to.have.property('pulse');
    }
});
```

#### **View Patient History**
```http
GET {{base_url}}/api/v1/consultations/patient/{{patient_id}}/history
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `limit` (optional): Number of consultations to retrieve
- `includeVitalSigns` (optional): Include vital signs in response (default: true)
- `includeDiagnosis` (optional): Include diagnosis information (default: true)
- `fromDate` (optional): Start date for history (YYYY-MM-DD)
- `toDate` (optional): End date for history (YYYY-MM-DD)

---

### 📂 Vital Signs Management (Nurse-specific)

#### **Record Patient Vital Signs**
```http
POST {{base_url}}/api/v1/patients/{{patient_id}}/vital-signs
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "bloodPressure": "120/80",
  "temperature": 36.8,
  "pulse": 72,
  "respiratoryRate": 16,
  "weight": 65,
  "height": 165,
  "oxygenSaturation": 98,
  "painLevel": 2,
  "bloodGlucose": 95,
  "bmi": 23.9,
  "recordedBy": "{{nurse_id}}",
  "notes": "Patient comfortable, no distress noted"
}
```

#### **View Patient Vital Signs History**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/vital-signs?limit=10
Authorization: Bearer {{access_token}}
```

---

### 📂 Medication Administration (Nurse-specific)

#### **Record Medication Administration**
```http
POST {{base_url}}/api/v1/patients/{{patient_id}}/medication-administration
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "medicationName": "Albuterol Inhaler",
  "dosage": "2 puffs",
  "route": "Inhalation",
  "administeredBy": "{{nurse_id}}",
  "administeredAt": "2024-11-18T09:30:00Z",
  "patientResponse": "Good response, breathing improved",
  "notes": "Patient demonstrated proper inhaler technique"
}
```

#### **View Medication Administration Log**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/medication-administration?date={{date}}
Authorization: Bearer {{access_token}}
```

---

### 📂 My Profile

#### **View My Profile**
```http
GET {{base_url}}/api/v1/users/{{nurse_id}}
Authorization: Bearer {{access_token}}
```

#### **Update My Profile**
```http
PUT {{base_url}}/api/v1/users/{{nurse_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "1234567899",
  "department": "ICU",
  "shift": "Night Shift",
  "licenseNumber": "NUR-2024-002",
  "certifications": ["BLS", "ACLS", "PALS"],
  "experience": 7,
  "specializations": ["Critical Care", "Emergency Medicine"],
  "availableShifts": {
    "monday": {"shift": "night", "start": "19:00", "end": "07:00"},
    "tuesday": {"shift": "night", "start": "19:00", "end": "07:00"},
    "wednesday": {"shift": "night", "start": "19:00", "end": "07:00"}
  }
}
```

#### **Change Password**
```http
PUT {{base_url}}/api/v1/users/{{nurse_id}}/password
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "Nurse@123",
  "newPassword": "NewNurse@456",
  "confirmPassword": "NewNurse@456"
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

### Nurse-specific Tests
```javascript
pm.test("Nurse has required permissions", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.user) {
        pm.expect(jsonData.data.user.role.name).to.equal('nurse');
    }
});

pm.test("Vital signs recorded by nurse", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.recordedBy) {
        pm.expect(jsonData.data.recordedBy).to.equal(pm.environment.get("nurse_id"));
    }
});
```

### Validation Tests
```javascript
pm.test("Patient data validation", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.patient) {
        pm.expect(jsonData.data.patient).to.have.property('firstName');
        pm.expect(jsonData.data.patient).to.have.property('lastName');
        pm.expect(jsonData.data.patient).to.have.property('dateOfBirth');
    }
});
```

---

## 🔧 Environment Variables

Required variables for nurse operations:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "nurse_id": "",
  "patient_id": "",
  "doctor_id": "",
  "termin_id": "",
  "consultation_id": "",
  "vital_signs_id": "",
  "medication_admin_id": ""
}
```

---

## 📝 Notes

1. **Patient Care**: Nurses have comprehensive patient management capabilities
2. **Vital Signs**: Special permissions for recording and monitoring vital signs
3. **Medication**: Can record medication administration and patient responses
4. **Consultations**: Read-only access to consultation details for care coordination
5. **Appointments**: Full CRUD operations for appointment management
6. **Documentation**: All nursing activities are logged for audit purposes

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Nurse Operations