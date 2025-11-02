# HealthPulse API - Doctor Operations Collection

## 📋 Doctor Collection Overview

This document provides detailed API documentation for all doctor operations in the HealthPulse system. Doctors can manage their schedule, patients, consultations, prescriptions, and lab orders.

---

## 🔐 Authentication

### Doctor Login
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "doctor@healthpulse.com",
  "password": "Doctor@123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
    pm.environment.set("doctor_id", response.data.user.id);
}
```

---

## 📁 3. Doctor Operations

### 📂 My Schedule

#### **View Today's Appointments**
```http
GET {{base_url}}/api/v1/termins/doctor/{{doctor_id}}/today
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `status` (optional): Filter by status (pending/confirmed/completed/cancelled)

#### **View Weekly Schedule**
```http
GET {{base_url}}/api/v1/termins/doctor/{{doctor_id}}/weekly?week={{week_start_date}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `week` (optional): Week start date (YYYY-MM-DD), defaults to current week

#### **Check My Availability**
```http
GET {{base_url}}/api/v1/termins/doctor/{{doctor_id}}/availability?date={{date}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `date` (required): Date to check (YYYY-MM-DD)
- `duration` (optional): Appointment duration in minutes (default: 30)

#### **View Upcoming Appointments**
```http
GET {{base_url}}/api/v1/termins/doctor/{{doctor_id}}/upcoming?limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `limit` (optional): Number of appointments to retrieve (default: 10)
- `days` (optional): Number of days ahead to look (default: 7)

---

### 📂 My Patients

#### **Create Patient**
```http
POST {{base_url}}/api/v1/patients
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "patient@healthpulse.com",
  "password": "password",
  "fname": "John",
  "lname": "Doe",
  "phone": "0612345602"
}
```

**Note:** Patients are created with patient role automatically. Use the correct field names (`fname`/`lname`) as used in the User model.

#### **List My Patients**
```http
GET {{base_url}}/api/v1/patients?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

#### **View Patient Details**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}
Authorization: Bearer {{access_token}}
```

#### **View Patient Medical History** ✨ NEW
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}/medical-history
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `includeConsultations` (optional): Include consultation history (default: true)
- `includePrescriptions` (optional): Include prescription history (default: true)
- `includeLabOrders` (optional): Include lab order history (default: true)
- `fromDate` (optional): Start date for history (YYYY-MM-DD)
- `toDate` (optional): End date for history (YYYY-MM-DD)

#### **Update Patient Info**
```http
PUT {{base_url}}/api/v1/patients/{{patient_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "0612345603",
  "fname": "John",
  "lname": "Doe"
}
```

#### **Get Patient by ID**
```http
GET {{base_url}}/api/v1/patients/{{patient_id}}
Authorization: Bearer {{access_token}}
```

**Path Parameters:**
- `patient_id` (required): The specific patient ID to retrieve

**Note:** Now uses dedicated patient endpoints for better organization.

---

### 📂 Appointments

#### **View My Appointments**
```http
GET {{base_url}}/api/v1/termins/doctor/{{doctor_id}}?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `date` (optional): Filter by specific date
- `patientId` (optional): Filter by patient

#### **Get Appointment Details**
```http
GET {{base_url}}/api/v1/termins/{{termin_id}}
Authorization: Bearer {{access_token}}
```

#### **Complete Appointment**
```http
PATCH {{base_url}}/api/v1/termins/{{termin_id}}/complete
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Appointment completed successfully. Patient advised for follow-up.",
  "nextAppointmentRecommended": true,
  "followUpDate": "2024-12-01"
}
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
  "reason": "Doctor emergency",
  "notifyPatient": true,
  "offerReschedule": true
}
```

---

### 📂 Consultations ✨ NEW

#### **Create Consultation**
```http
POST {{base_url}}/api/v1/consultations
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": "{{appointment_id}}",
  "patientId": "{{patient_id}}",
  "chiefComplaint": "Persistent headache for 3 days",
  "symptoms": ["Headache", "Nausea", "Photophobia", "Dizziness"],
  "consultationType": "in-person"
}
```

**Note:** `doctorId` and `createdBy` are automatically set from the authenticated user.

#### **Get All Consultations**
```http
GET {{base_url}}/api/v1/consultations?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (scheduled/in-progress/completed/cancelled)
- `patientId` (optional): Filter by patient
- `doctorId` (optional): Filter by doctor
- `dateFrom` (optional): From date (YYYY-MM-DD)
- `dateTo` (optional): To date (YYYY-MM-DD)

#### **List My Consultations**
```http
GET {{base_url}}/api/v1/consultations/my?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `includeCompleted` (optional): Include completed consultations (default: true)

#### **Get Consultation Details**
```http
GET {{base_url}}/api/v1/consultations/{{consultation_id}}
Authorization: Bearer {{access_token}}
```

#### **Update Consultation**
```http
PUT {{base_url}}/api/v1/consultations/{{consultation_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "diagnosis": "Updated diagnosis: Migraine with aura",
  "treatmentPlan": "Updated treatment plan with preventive measures",
  "notes": "Patient shows improvement with current treatment",
  "followUpDate": "2024-11-25"
}
```

#### **Add Vital Signs**
```http
POST {{base_url}}/api/v1/consultations/{{consultation_id}}/vital-signs
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
  "weight": 70,
  "height": 175,
  "oxygenSaturation": 99,
  "painLevel": 3,
  "recordedAt": "2024-11-18T10:30:00Z"
}
```

**Note:** Vital signs are added to the consultation record for medical documentation.

#### **Add Diagnosis**
```http
POST {{base_url}}/api/v1/consultations/{{consultation_id}}/diagnosis
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "primaryDiagnosis": "Migraine without aura",
  "secondaryDiagnosis": ["Tension headache", "Sleep deprivation"],
  "icdCodes": ["G43.009", "G44.209"],
  "severity": "Moderate",
  "notes": "Diagnosis confirmed based on symptoms and examination"
}
```

#### **Complete Consultation**
```http
PATCH {{base_url}}/api/v1/consultations/{{consultation_id}}/complete
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "finalDiagnosis": "Migraine without aura",
  "treatmentPlan": "Pain management and lifestyle modifications",
  "followUpRequired": true,
  "followUpDate": "2024-12-01",
  "dischargeSummary": "Patient stable, symptoms improved with treatment"
}
```

#### **Get Patient Consultation History**
```http
GET {{base_url}}/api/v1/consultations/patient/{{patient_id}}/history?doctorId={{doctor_id}}
Authorization: Bearer {{access_token}}
```

---

### 📂 Prescriptions ✨ NEW

#### **Create Prescription**
```http
POST {{base_url}}/api/v1/prescriptions
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "consultationId": "{{consultation_id}}",
  "patientId": "{{patient_id}}",
  "medications": [
    {
      "medicationName": "Ibuprofen 400mg",
      "genericName": "Ibuprofen",
      "dosage": "400mg",
      "dosageForm": "tablet",
      "frequency": "3 times daily",
      "route": "oral",
      "duration": {
        "value": 7,
        "unit": "days"
      },
      "quantity": 21,
      "instructions": "Take with food to prevent stomach upset"
    }
  ],
  "doctorNotes": "Patient should avoid alcohol while taking medication. Return if symptoms persist."
}
```

**Note:** `doctorId` is automatically set from the authenticated user. `validUntil` defaults to 90 days if not specified.

#### **Add Medication to Prescription**
```http
PUT {{base_url}}/api/v1/prescriptions/{{prescription_id}}/medications
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "medicationName": "Amoxicillin 500mg",
  "genericName": "Amoxicillin",
  "dosage": "500mg",
  "dosageForm": "capsule",
  "frequency": "twice daily",
  "route": "oral",
  "duration": {
    "value": 10,
    "unit": "days"
  },
  "quantity": 20,
  "instructions": "Complete full course even if feeling better"
}
```

#### **List My Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (draft/signed/dispensed/cancelled)

**Note:** This endpoint is context-aware - doctors see their created prescriptions, patients see their prescriptions, pharmacists see assigned prescriptions.

#### **Add Medication to Prescription**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}
Authorization: Bearer {{access_token}}
```

#### **Update Prescription (Draft only)**
```http
PUT {{base_url}}/api/v1/prescriptions/{{prescription_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Updated instructions: Take medication with plenty of water",
  "validUntil": "2024-12-25",
  "medications": [
    {
      "id": "{{medication_id}}",
      "instructions": "Updated: Take with food and plenty of water"
    }
  ]
}
```

#### **Sign Prescription**
```http
POST {{base_url}}/api/v1/prescriptions/{{prescription_id}}/sign
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "digitalSignature": true,
  "signedAt": "2024-11-18T14:30:00Z"
}
```

#### **Assign to Pharmacy**
```http
POST {{base_url}}/api/v1/prescriptions/{{prescription_id}}/assign-pharmacy
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "pharmacyId": "{{pharmacy_id}}",
  "urgency": "normal",
  "deliveryMethod": "pickup",
  "notes": "Patient prefers pickup after 2 PM"
}
```

#### **View Prescription Status**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}/status
Authorization: Bearer {{access_token}}
```

#### **Cancel Prescription**
```http
PATCH {{base_url}}/api/v1/prescriptions/{{prescription_id}}/cancel
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Patient condition improved, medication no longer needed",
  "notifyPharmacy": true
}
```

---

### 📂 Lab Orders ✨ NEW

#### **Create Lab Order**
```http
POST {{base_url}}/api/v1/lab-orders
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
      "instructions": "Fasting not required"
    },
    {
      "name": "Basic Metabolic Panel",
      "code": "BMP",
      "category": "Chemistry",
      "urgency": "routine",
      "instructions": "12-hour fasting required"
    }
  ],
  "clinicalIndication": "Routine health check and headache workup",
  "urgency": "routine",
  "notes": "Patient has history of hypertension",
  "fastingRequired": true,
  "scheduledDate": "2024-11-20"
}
```

#### **Add Tests to Order (PUT)**
```http
PUT {{base_url}}/api/v1/lab-orders/{{order_id}}/tests
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Thyroid Function Panel",
  "code": "TFP",
  "category": "Endocrinology",
  "urgency": "routine",
  "instructions": "Morning collection preferred"
}
```

#### **List My Lab Orders**
```http
GET {{base_url}}/api/v1/lab-orders/doctor/{{doctor_id}}?page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending/in_progress/completed/cancelled)
- `patientId` (optional): Filter by patient
- `laboratoryId` (optional): Filter by laboratory
- `urgency` (optional): Filter by urgency (stat/urgent/routine)

#### **Get Lab Order Details**
```http
GET {{base_url}}/api/v1/lab-orders/{{order_id}}
Authorization: Bearer {{access_token}}
```

#### **View Lab Results**
```http
GET {{base_url}}/api/v1/lab-orders/{{order_id}}/results
Authorization: Bearer {{access_token}}
```

#### **Cancel Lab Order**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{order_id}}/cancel
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Patient condition resolved, tests no longer needed",
  "notifyLaboratory": true
}
```

---

### 📂 My Profile

#### **View My Profile**
```http
GET {{base_url}}/api/v1/users/{{doctor_id}}
Authorization: Bearer {{access_token}}
```

#### **Update My Profile**
```http
PUT {{base_url}}/api/v1/users/{{doctor_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "1234567899",
  "specialization": "Cardiology and Internal Medicine",
  "qualifications": "MD, FACC, FAHA",
  "experience": 12,
  "availableHours": {
    "monday": {"start": "09:00", "end": "17:00"},
    "tuesday": {"start": "09:00", "end": "17:00"},
    "wednesday": {"start": "09:00", "end": "17:00"},
    "thursday": {"start": "09:00", "end": "17:00"},
    "friday": {"start": "09:00", "end": "15:00"}
  }
}
```

#### **Change Password**
```http
PUT {{base_url}}/api/v1/users/{{doctor_id}}/password
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "Doctor@123",
  "newPassword": "NewDoctor@456",
  "confirmPassword": "NewDoctor@456"
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

pm.test("Response has data field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});
```

### Doctor-specific Tests
```javascript
pm.test("Doctor has required permissions", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.user) {
        pm.expect(jsonData.data.user.role.name).to.equal('doctor');
    }
});

pm.test("Consultation belongs to doctor", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.doctorId) {
        pm.expect(jsonData.data.doctorId).to.equal(pm.environment.get("doctor_id"));
    }
});
```

---

## 🔧 Environment Variables

Required variables for doctor operations:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "doctor_id": "",
  "patient_id": "",
  "termin_id": "",
  "consultation_id": "",
  "prescription_id": "",
  "lab_order_id": "",
  "pharmacy_id": "",
  "laboratory_id": ""
}
```

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Doctor Operations