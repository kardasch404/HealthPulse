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

#### **View My Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions/patient/{{patient_id}}?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (signed/dispensed/cancelled)
- `active` (optional): Show only active prescriptions
- `doctorId` (optional): Filter by prescribing doctor
- `pharmacyId` (optional): Filter by dispensing pharmacy

#### **View Active Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions/patient/{{patient_id}}/active
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Active prescriptions for patient", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('prescriptions');
    jsonData.data.prescriptions.forEach(prescription => {
        pm.expect(prescription.status).to.be.oneOf(['signed', 'dispensed']);
        pm.expect(prescription.patientId).to.equal(pm.environment.get("patient_id"));
    });
});
```

#### **Get Prescription Details**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Patient can only view own prescriptions", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.patientId).to.equal(pm.environment.get("patient_id"));
});
```

#### **Track Prescription Status**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}/status
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Prescription status tracking", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('currentStatus');
    pm.expect(jsonData.data).to.have.property('statusHistory');
    pm.expect(jsonData.data.statusHistory).to.be.an('array');
});
```

---

### 📂 My Lab Orders ✨ NEW

#### **View My Lab Orders**
```http
GET {{base_url}}/api/v1/lab-orders/patient/{{patient_id}}?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending/in_progress/completed)
- `fromDate` (optional): Start date filter
- `toDate` (optional): End date filter
- `doctorId` (optional): Filter by ordering doctor
- `laboratoryId` (optional): Filter by laboratory

#### **Get Lab Order Details**
```http
GET {{base_url}}/api/v1/lab-orders/{{lab_order_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Patient can only view own lab orders", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.patientId).to.equal(pm.environment.get("patient_id"));
});
```

#### **View Lab Results**
```http
GET {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `format` (optional): Result format (detailed/summary/pdf)
- `includeReference` (optional): Include reference ranges (default: true)
- `includeTrends` (optional): Include historical trends (default: false)

**Test Script:**
```javascript
pm.test("Lab results contain test data", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.results) {
        pm.expect(jsonData.data.results).to.be.an('array');
        pm.expect(jsonData.data).to.have.property('completedDate');
    }
});
```

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