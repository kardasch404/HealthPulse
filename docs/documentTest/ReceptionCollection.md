# HealthPulse API - Reception Operations Collection

## 📋 Reception Collection Overview

This document provides detailed API documentation for all reception operations in the HealthPulse system. Reception staff handle patient registration, appointment scheduling, and partner services coordination.

---

## 🔐 Authentication

### Reception Login
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "reception@healthpulse.com",
  "password": "Reception@123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
    pm.environment.set("reception_id", response.data.user.id);
}
```

---

## 📁 5. Reception Operations

### 📂 Patient Registration

#### **Create Patient**
```http
POST {{base_url}}/api/v1/patients
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Maria",
  "lastName": "Garcia",
  "email": "maria.garcia@email.com",
  "phone": "1234567890",
  "dateOfBirth": "1985-03-12",
  "gender": "Female",
  "address": "789 Elm Street, City, State 12345",
  "emergencyContact": {
    "name": "Carlos Garcia",
    "phone": "0987654321",
    "relationship": "Spouse"
  },
  "bloodType": "O-",
  "allergies": ["Shellfish", "Iodine"],
  "medicalHistory": ["Thyroid disorder", "Anxiety"],
  "insurance": {
    "provider": "BlueCross BlueShield",
    "policyNumber": "BC123456789",
    "groupNumber": "GRP003",
    "verified": true
  },
  "registrationSource": "Walk-in",
  "preferredLanguage": "Spanish",
  "registeredBy": "{{reception_id}}"
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("patient_id", response.data.id);
    pm.test("Patient registered by reception", function () {
        pm.expect(response.data.registeredBy).to.equal(pm.environment.get("reception_id"));
    });
}
```

#### **Search Patients**
```http
GET {{base_url}}/api/v1/patients/search?q={{search_term}}&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `q` (required): Search term (name, email, phone, patient ID, insurance number)
- `limit` (optional): Number of results (default: 10)
- `includeInactive` (optional): Include inactive patients (default: false)
- `verifyInsurance` (optional): Only show patients with verified insurance

**Test Script:**
```javascript
pm.test("Search returns patient results", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('patients');
    pm.expect(jsonData.data.patients).to.be.an('array');
});
```

#### **Get Patient Details**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Patient details include insurance info", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('insurance');
    pm.expect(jsonData.data.insurance).to.have.property('provider');
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
  "address": "456 New Avenue, City, State 12345",
  "emergencyContact": {
    "name": "Carlos Garcia",
    "phone": "0987654322",
    "relationship": "Spouse"
  },
  "insurance": {
    "provider": "BlueCross BlueShield",
    "policyNumber": "BC123456789",
    "groupNumber": "GRP003",
    "verified": true,
    "verifiedBy": "{{reception_id}}",
    "verificationDate": "2024-11-18",
    "copay": 25,
    "deductible": 500
  },
  "preferredLanguage": "Spanish",
  "communicationPreferences": {
    "method": "phone",
    "timePreference": "morning",
    "language": "Spanish"
  }
}
```

---

### 📂 Appointment Scheduling

#### **Check Doctor Availability**
```http
GET {{base_url}}/api/v1/doctors/{{doctor_id}}/availability?date={{date}}&duration=30
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `date` (required): Date to check (YYYY-MM-DD)
- `duration` (optional): Appointment duration in minutes (default: 30)
- `appointmentType` (optional): Type of appointment (consultation/follow-up/procedure)

**Test Script:**
```javascript
pm.test("Doctor availability returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('availableSlots');
    pm.expect(jsonData.data.availableSlots).to.be.an('array');
});
```

#### **Find Available Doctors**
```http
GET {{base_url}}/api/v1/doctors/available?date={{date}}&time={{time}}&specialization={{specialization}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `date` (required): Preferred date (YYYY-MM-DD)
- `time` (optional): Preferred time (HH:MM)
- `specialization` (optional): Required specialization
- `department` (optional): Specific department
- `duration` (optional): Required duration in minutes

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
  "appointmentTime": "14:30",
  "duration": 30,
  "type": "consultation",
  "reason": "New patient consultation for thyroid disorder",
  "priority": "normal",
  "department": "Endocrinology",
  "notes": "Patient speaks Spanish, interpreter may be needed",
  "createdBy": "{{reception_id}}",
  "patientInstructions": "Please arrive 15 minutes early for check-in. Bring insurance card and ID.",
  "confirmationMethod": "phone",
  "insuranceVerified": true,
  "copayAmount": 25
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("termin_id", response.data.id);
    pm.test("Appointment created by reception", function () {
        pm.expect(response.data.createdBy).to.equal(pm.environment.get("reception_id"));
    });
}
```

#### **View All Appointments**
```http
GET {{base_url}}/api/v1/termins?page=1&limit=20&date={{date}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `status` (optional): Filter by status
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `department` (optional): Filter by department

#### **Get Appointment Details**
```http
GET {{base_url}}/api/v1/termins/{{termin_id}}
Authorization: Bearer {{access_token}}
```

#### **Cancel Appointment**
```http
PATCH {{base_url}}/api/v1/termins/{{termin_id}}/cancel
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Patient requested cancellation due to scheduling conflict",
  "cancelledBy": "{{reception_id}}",
  "notifyDoctor": true,
  "notifyPatient": true,
  "refundRequired": false,
  "offerReschedule": true
}
```

#### **Reschedule Appointment**
```http
PATCH {{base_url}}/api/v1/termins/{{termin_id}}/reschedule
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "newDate": "2024-11-27",
  "newTime": "10:00",
  "reason": "Doctor schedule change",
  "rescheduledBy": "{{reception_id}}",
  "notifyPatient": true,
  "confirmationMethod": "phone"
}
```

---

### 📂 Partner Services ✨ NEW

#### **Search Nearby Pharmacies**
```http
GET {{base_url}}/api/v1/pharmacies/search?q={{search_term}}&location={{location}}&is24Hours={{is24Hours}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `q` (optional): Search term (name, license number)
- `location` (optional): Location filter (coordinates or address)
- `is24Hours` (optional): Filter 24-hour pharmacies
- `services` (optional): Required services (delivery, consultation)
- `radius` (optional): Search radius in kilometers (default: 10)
- `limit` (optional): Number of results (default: 10)

**Test Script:**
```javascript
pm.test("Pharmacy search results", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('pharmacies');
    pm.expect(jsonData.data.pharmacies).to.be.an('array');
});
```

#### **Get Pharmacy Details**
```http
GET {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Pharmacy details include working hours", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('workingHours');
    pm.expect(jsonData.data).to.have.property('phone');
    pm.expect(jsonData.data).to.have.property('address');
});
```

#### **Search Nearby Laboratories**
```http
GET {{base_url}}/api/v1/laboratories/search?q={{search_term}}&services={{services}}&accreditation={{accreditation}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `q` (optional): Search term (name, license number)
- `services` (optional): Required services (blood tests, imaging, pathology)
- `accreditation` (optional): Required accreditation (CAP, CLIA)
- `location` (optional): Location filter
- `urgency` (optional): Support for urgent tests
- `limit` (optional): Number of results (default: 10)

#### **Get Laboratory Details**
```http
GET {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Laboratory details include services", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('services');
    pm.expect(jsonData.data).to.have.property('turnaroundTime');
    pm.expect(jsonData.data).to.have.property('accreditation');
});
```

---

### 📂 Insurance Verification (Reception-specific)

#### **Verify Patient Insurance**
```http
POST {{base_url}}/api/v1/patients/{{patient_id}}/verify-insurance
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "verifiedBy": "{{reception_id}}",
  "verificationMethod": "phone",
  "insuranceDetails": {
    "provider": "BlueCross BlueShield",
    "policyNumber": "BC123456789",
    "groupNumber": "GRP003",
    "memberName": "Maria Garcia",
    "effectiveDate": "2024-01-01",
    "expirationDate": "2024-12-31",
    "copay": 25,
    "deductible": 500,
    "deductibleMet": 150
  }
}
```

#### **Get Insurance Benefits**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/insurance/benefits?serviceType={{service_type}}
Authorization: Bearer {{access_token}}
```

---

### 📂 Check-in Management (Reception-specific)

#### **Patient Check-in**
```http
POST {{base_url}}/api/v1/termins/{{termin_id}}/check-in
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "checkedInBy": "{{reception_id}}",
  "checkedInAt": "2024-11-25T14:15:00Z",
  "insuranceVerified": true,
  "copayCollected": true,
  "copayAmount": 25,
  "paymentMethod": "credit_card",
  "documentsCollected": ["insurance_card", "id", "referral"],
  "notes": "Patient arrived early, all documents verified"
}
```

#### **Update Check-in Status**
```http
PATCH {{base_url}}/api/v1/termins/{{termin_id}}/check-in-status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "ready_for_doctor",
  "waitingArea": "Room 3",
  "estimatedWaitTime": 15,
  "notes": "Patient comfortable in waiting area"
}
```

---

### 📂 My Profile

#### **View My Profile**
```http
GET {{base_url}}/api/v1/users/{{reception_id}}
Authorization: Bearer {{access_token}}
```

#### **Update My Profile**
```http
PUT {{base_url}}/api/v1/users/{{reception_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "1234567899",
  "department": "Front Desk",
  "shift": "Day Shift",
  "workStation": "Reception Desk 1",
  "languages": ["English", "Spanish"],
  "certifications": ["Customer Service", "Medical Terminology"],
  "experience": 3,
  "specializations": ["Insurance Verification", "Appointment Scheduling"],
  "workingHours": {
    "monday": {"start": "08:00", "end": "17:00"},
    "tuesday": {"start": "08:00", "end": "17:00"},
    "wednesday": {"start": "08:00", "end": "17:00"},
    "thursday": {"start": "08:00", "end": "17:00"},
    "friday": {"start": "08:00", "end": "17:00"}
  }
}
```

#### **Change Password**
```http
PUT {{base_url}}/api/v1/users/{{reception_id}}/password
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "Reception@123",
  "newPassword": "NewReception@456",
  "confirmPassword": "NewReception@456"
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

### Reception-specific Tests
```javascript
pm.test("Reception has required permissions", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.user) {
        pm.expect(jsonData.data.user.role.name).to.equal('reception');
    }
});

pm.test("Patient registered by reception", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.registeredBy) {
        pm.expect(jsonData.data.registeredBy).to.equal(pm.environment.get("reception_id"));
    }
});

pm.test("Insurance verification completed", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.insurance) {
        pm.expect(jsonData.data.insurance.verified).to.be.true;
        pm.expect(jsonData.data.insurance.verifiedBy).to.equal(pm.environment.get("reception_id"));
    }
});
```

### Appointment Tests
```javascript
pm.test("Appointment has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('appointmentDate');
    pm.expect(jsonData.data).to.have.property('appointmentTime');
    pm.expect(jsonData.data).to.have.property('patientId');
    pm.expect(jsonData.data).to.have.property('doctorId');
});
```

---

## 🔧 Environment Variables

Required variables for reception operations:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "reception_id": "",
  "patient_id": "",
  "doctor_id": "",
  "termin_id": "",
  "pharmacy_id": "",
  "laboratory_id": "",
  "insurance_verification_id": ""
}
```

---

## 📝 Notes

1. **Patient Registration**: Comprehensive patient intake and registration
2. **Insurance**: Full insurance verification and benefits checking
3. **Scheduling**: Advanced appointment scheduling with conflict resolution
4. **Partner Services**: Integration with pharmacies and laboratories
5. **Check-in**: Complete patient check-in workflow
6. **Communication**: Multi-language support and patient communication preferences

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Reception Operations