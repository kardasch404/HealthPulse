# HealthPulse - Complete Postman API Testing Guide

## Table of Contents
1. [Setup](#setup)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Patient Management](#patient-management)
5. [Appointment Management (Termin)](#appointment-management)
6. [Consultation Management](#consultation-management)
7. [Prescription Management](#prescription-management)
8. [Pharmacy Management](#pharmacy-management)
9. [Laboratory Management](#laboratory-management)

---

## Setup

### Base URL
```
http://localhost:3000
```

### Environment Variables (Postman)
Create these variables in your Postman environment:
- `base_url`: `http://localhost:3000`
- `access_token`: (will be set automatically after login)
- `refresh_token`: (will be set automatically after login)

---

## Authentication

### 1. Register New User
**POST** `/api/v1/auth/register`

**Body (JSON):**
```json
{
  "fname": "John",
  "lname": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "673...",
      "email": "john.doe@example.com",
      "fname": "John",
      "lname": "Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

**Postman Tests Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
}
```

---

### 2. Login
**POST** `/api/v1/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@healthpulse.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "673...",
      "email": "admin@healthpulse.com",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

**Postman Tests Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
}
```

---

### 3. Refresh Token
**POST** `/api/v1/auth/refresh`

**Body (JSON):**
```json
{
  "refreshToken": "{{refresh_token}}"
}
```

---

### 4. Logout
**POST** `/api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

---

## User Management

**Note:** All user endpoints require authentication. Add this header to all requests:
```
Authorization: Bearer {{access_token}}
```

### 1. Get All Users (Admin only)
**GET** `/api/v1/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role

**Example:**
```
GET /api/v1/users?page=1&limit=10&role=doctor
```

---

### 2. Get User by ID
**GET** `/api/v1/users/:id`

**Example:**
```
GET /api/v1/users/673f077f5b2c1aac6ae25adf35
```

---

### 3. Create User (Admin only)
**POST** `/api/v1/users`

**Body (JSON):**
```json
{
  "fname": "Dr. Sarah",
  "lname": "Smith",
  "email": "dr.sarah@healthpulse.com",
  "password": "Doctor@123",
  "phone": "1234567890",
  "roleId": "673f077f5b2c1aac6ae25adf32"
}
```

---

### 4. Update User
**PUT** `/api/v1/users/:id`

**Body (JSON):**
```json
{
  "fname": "Dr. Sarah",
  "lname": "Johnson",
  "phone": "0987654321"
}
```

---

### 5. Delete User (Admin only)
**DELETE** `/api/v1/users/:id`

---

## Patient Management

### 1. Create Patient
**POST** `/api/v1/patients`

**Body (JSON):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "bloodType": "A+",
  "allergies": ["Penicillin", "Peanuts"],
  "chronicDiseases": ["Diabetes Type 2"],
  "emergencyContactName": "John Smith",
  "emergencyContactPhone": "0987654321",
  "assignedDoctorId": "673f077f5b2c1aac6ae25adf33",
  "notes": "Patient has history of asthma"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "id": "673...",
    "firstName": "Jane",
    "lastName": "Smith",
    "patientNumber": "P-2024-0001"
  }
}
```

---

### 2. Get All Patients
**GET** `/api/v1/patients`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `search` (optional): Search by name
- `doctorId` (optional): Filter by assigned doctor

**Example:**
```
GET /api/v1/patients?search=Jane&page=1&limit=10
```

---

### 3. Get Patient by ID
**GET** `/api/v1/patients/:id`

**Example:**
```
GET /api/v1/patients/673f077f5b2c1aac6ae25adf40
```

---

### 4. Update Patient
**PUT** `/api/v1/patients/:id`

**Body (JSON):**
```json
{
  "phone": "1112223333",
  "allergies": ["Penicillin", "Peanuts", "Latex"],
  "notes": "Updated patient notes"
}
```

---

### 5. Delete Patient (Admin only)
**DELETE** `/api/v1/patients/:id`

---

## Appointment Management (Termin)

### 1. Create Appointment
**POST** `/api/v1/termins`

**Body (JSON):**
```json
{
  "patientId": "673f077f5b2c1aac6ae25adf40",
  "doctorId": "673f077f5b2c1aac6ae25adf33",
  "date": "2024-11-15",
  "startTime": "14:00",
  "type": "consultation",
  "notes": "Patient complains of persistent headache"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "673...",
    "appointmentNumber": "APT-2024-0001",
    "status": "pending"
  }
}
```

**Response (Conflict):**
```json
{
  "success": false,
  "message": "Doctor is not available at this time",
  "conflicts": ["Appointment overlaps with existing appointment"],
  "alternatives": [
    {
      "date": "2024-11-15",
      "startTime": "15:00",
      "endTime": "15:30"
    }
  ]
}
```

---

### 2. Get Appointment by ID
**GET** `/api/v1/termins/:id`

**Example:**
```
GET /api/v1/termins/673f077f5b2c1aac6ae25adf50
```

---

### 3. Get All Appointments
**GET** `/api/v1/termins/all`

**Query Parameters:**
- `patientId` (optional)
- `doctorId` (optional)
- `status` (optional): pending, confirmed, completed, cancelled
- `type` (optional)
- `dateFrom` (optional): YYYY-MM-DD
- `dateTo` (optional): YYYY-MM-DD
- `page` (optional)
- `limit` (optional)

**Example:**
```
GET /api/v1/termins/all?doctorId=673f077f5b2c1aac6ae25adf33&status=pending&dateFrom=2024-11-01&dateTo=2024-11-30
```

---

### 4. Get Patient's Appointments
**GET** `/api/v1/termins/patient/:patientId`

**Query Parameters:**
- `includeCompleted` (optional): true/false (default: true)

**Example:**
```
GET /api/v1/termins/patient/673f077f5b2c1aac6ae25adf40?includeCompleted=false
```

---

### 5. Get Doctor's Schedule
**GET** `/api/v1/termins/doctor/:doctorId/schedule`

**Query Parameters:**
- `dateFrom` (required): YYYY-MM-DD
- `dateTo` (required): YYYY-MM-DD

**Example:**
```
GET /api/v1/termins/doctor/673f077f5b2c1aac6ae25adf33/schedule?dateFrom=2024-11-01&dateTo=2024-11-30
```

---

### 6. Check Doctor Availability
**GET** `/api/v1/termins/availability/:doctorId`

**Query Parameters:**
- `date` (required): YYYY-MM-DD
- `duration` (optional): minutes (default: 30)

**Example:**
```
GET /api/v1/termins/availability/673f077f5b2c1aac6ae25adf33?date=2024-11-15&duration=30
```

**Response:**
```json
{
  "success": true,
  "message": "Availability checked successfully",
  "available": true,
  "availableSlots": [
    {
      "startTime": "09:00",
      "endTime": "09:30"
    },
    {
      "startTime": "10:00",
      "endTime": "10:30"
    }
  ]
}
```

---

### 7. Find Available Doctors
**GET** `/api/v1/termins/find-doctors`

**Query Parameters:**
- `date` (required): YYYY-MM-DD
- `startTime` (required): HH:MM
- `endTime` (required): HH:MM
- `specialization` (optional)

**Example:**
```
GET /api/v1/termins/find-doctors?date=2024-11-15&startTime=14:00&endTime=14:30&specialization=Cardiology
```

---

### 8. Update Appointment
**PUT** `/api/v1/termins/:id`

**Body (JSON):**
```json
{
  "date": "2024-11-16",
  "startTime": "15:00",
  "notes": "Updated appointment notes"
}
```

---

### 9. Confirm Appointment
**PATCH** `/api/v1/termins/:id/confirm`

---

### 10. Cancel Appointment
**PATCH** `/api/v1/termins/:id/cancel`

**Body (JSON):**
```json
{
  "reason": "Patient requested cancellation due to emergency"
}
```

---

### 11. Complete Appointment
**PATCH** `/api/v1/termins/:id/complete`

---

### 12. Get Upcoming Appointments
**GET** `/api/v1/termins/upcoming`

**Query Parameters:**
- `doctorId` (optional)
- `patientId` (optional)
- `days` (optional): number of days (default: 7)

**Example:**
```
GET /api/v1/termins/upcoming?doctorId=673f077f5b2c1aac6ae25adf33&days=14
```

---

### 13. Get Today's Appointments
**GET** `/api/v1/termins/today/:doctorId`

**Example:**
```
GET /api/v1/termins/today/673f077f5b2c1aac6ae25adf33
```

---

### 14. Reschedule Appointment
**POST** `/api/v1/termins/:id/reschedule`

**Body (JSON):**
```json
{
  "newDate": "2024-11-20",
  "newStartTime": "10:00",
  "newDuration": 30
}
```

---

## Consultation Management

### 1. Create Consultation
**POST** `/api/v1/consultations`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body (JSON):**
```json
{
  "terminId": "673f077f5b2c1aac6ae25adf50",
  "patientId": "673f077f5b2c1aac6ae25adf40",
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

**Response:**
```json
{
  "success": true,
  "message": "Consultation created successfully",
  "data": {
    "id": "673...",
    "consultationNumber": "CONS-2024-0001",
    "status": "in-progress"
  }
}
```

---

### 2. Get Consultation by ID
**GET** `/api/v1/consultations/:id`

**Example:**
```
GET /api/v1/consultations/673f077f5b2c1aac6ae25adf60
```

---

### 3. Get All Consultations
**GET** `/api/v1/consultations`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `status` (optional): in-progress, completed, cancelled

**Example:**
```
GET /api/v1/consultations?status=completed&page=1&limit=10
```

---

### 4. Get Doctor's Consultations
**GET** `/api/v1/consultations/doctor/:doctorId`

**Query Parameters:**
- `includeCompleted` (optional): true/false (default: true)

**Example:**
```
GET /api/v1/consultations/doctor/673f077f5b2c1aac6ae25adf33?includeCompleted=false
```

---

### 5. Get Patient History
**GET** `/api/v1/consultations/patient/:patientId/history`

**Query Parameters:**
- `doctorId` (optional): Filter by specific doctor

**Example:**
```
GET /api/v1/consultations/patient/673f077f5b2c1aac6ae25adf40/history
```

---

### 6. Update Consultation
**PUT** `/api/v1/consultations/:id`

**Body (JSON):**
```json
{
  "diagnosis": "Migraine with aura",
  "treatmentPlan": "Prescribed medication and lifestyle changes",
  "notes": "Patient responded well to treatment"
}
```

---

### 7. Complete Consultation
**PATCH** `/api/v1/consultations/:id/complete`

---

### 8. Delete Consultation (Admin only)
**DELETE** `/api/v1/consultations/:id`

---

## Prescription Management

### 1. Create Prescription
**POST** `/api/v1/prescriptions`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body (JSON):**
```json
{
  "consultationId": "673f077f5b2c1aac6ae25adf60",
  "patientId": "673f077f5b2c1aac6ae25adf40",
  "medications": [
    {
      "name": "Ibuprofen 400mg",
      "dosage": "400mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take with food"
    },
    {
      "name": "Paracetamol 500mg",
      "dosage": "500mg",
      "frequency": "As needed",
      "duration": "5 days",
      "instructions": "Do not exceed 4 doses per day"
    }
  ],
  "notes": "Patient should avoid alcohol while taking medication"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prescription created successfully",
  "data": {
    "id": "673...",
    "prescriptionNumber": "RX-2024-0001",
    "status": "draft"
  }
}
```

---

### 2. Get Prescription by ID
**GET** `/api/v1/prescriptions/:id`

**Example:**
```
GET /api/v1/prescriptions/673f077f5b2c1aac6ae25adf70
```

---

### 3. Get All Prescriptions
**GET** `/api/v1/prescriptions`

**Query Parameters:**
- `patientId` (optional)
- `doctorId` (optional)
- `status` (optional): draft, signed, dispensed, completed, cancelled
- `page` (optional)
- `limit` (optional)

**Example:**
```
GET /api/v1/prescriptions?patientId=673f077f5b2c1aac6ae25adf40&status=signed
```

---

### 4. Add Medication to Prescription
**POST** `/api/v1/prescriptions/:id/medications`

**Body (JSON):**
```json
{
  "name": "Aspirin 100mg",
  "dosage": "100mg",
  "frequency": "Once daily",
  "duration": "30 days",
  "instructions": "Take in the morning with water"
}
```

---

### 5. Update Prescription
**PUT** `/api/v1/prescriptions/:id`

**Body (JSON):**
```json
{
  "medications": [
    {
      "name": "Ibuprofen 400mg",
      "dosage": "400mg",
      "frequency": "2 times daily",
      "duration": "10 days",
      "instructions": "Take with food"
    }
  ],
  "notes": "Updated medication schedule"
}
```

---

### 6. Sign Prescription (Doctor only)
**POST** `/api/v1/prescriptions/:id/sign`

**Response:**
```json
{
  "success": true,
  "message": "Prescription signed successfully",
  "data": {
    "status": "signed",
    "signedAt": "2024-11-15T10:30:00.000Z"
  }
}
```

---

### 7. Assign to Pharmacy
**POST** `/api/v1/prescriptions/:id/assign-pharmacy`

**Body (JSON):**
```json
{
  "pharmacyId": "673f077f5b2c1aac6ae25adf80"
}
```

---

### 8. Update Prescription Status (Pharmacist)
**PATCH** `/api/v1/prescriptions/:id/status`

**Body (JSON):**
```json
{
  "status": "dispensed"
}
```

---

### 9. Cancel Prescription
**PATCH** `/api/v1/prescriptions/:id/cancel`

---

### 10. Get Pharmacy Prescriptions (Pharmacist)
**GET** `/api/v1/prescriptions/pharmacy/:pharmacyId`

**Query Parameters:**
- `status` (optional): signed, dispensed, completed

**Example:**
```
GET /api/v1/prescriptions/pharmacy/673f077f5b2c1aac6ae25adf80?status=signed
```

---

## Pharmacy Management

### 1. Register Pharmacy (Admin only)
**POST** `/api/v1/pharmacies`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body (JSON):**
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
    "wednesday": {
      "open": "08:00",
      "close": "20:00",
      "isClosed": false
    },
    "thursday": {
      "open": "08:00",
      "close": "20:00",
      "isClosed": false
    },
    "friday": {
      "open": "08:00",
      "close": "20:00",
      "isClosed": false
    },
    "saturday": {
      "open": "09:00",
      "close": "18:00",
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

**Response:**
```json
{
  "success": true,
  "message": "Pharmacy registered successfully",
  "data": {
    "id": "673...",
    "name": "MediCare Pharmacy",
    "licenseNumber": "PHR-2024-001",
    "status": "active"
  }
}
```

---

### 2. Get All Pharmacies
**GET** `/api/v1/pharmacies`

**Query Parameters:**
- `status` (optional): active, suspended, inactive
- `page` (optional)
- `limit` (optional)

**Example:**
```
GET /api/v1/pharmacies?status=active&page=1&limit=10
```

---

### 3. Get Pharmacy by ID
**GET** `/api/v1/pharmacies/:id`

**Example:**
```
GET /api/v1/pharmacies/673f077f5b2c1aac6ae25adf80
```

---

### 4. Update Pharmacy (Admin only)
**PUT** `/api/v1/pharmacies/:id`

**Body (JSON):**
```json
{
  "phone": "1112223333",
  "email": "newemail@medicare-pharmacy.com",
  "is24Hours": true
}
```

---

### 5. Activate Pharmacy (Admin only)
**PATCH** `/api/v1/pharmacies/:id/activate`

---

### 6. Suspend Pharmacy (Admin only)
**PATCH** `/api/v1/pharmacies/:id/suspend`

**Body (JSON):**
```json
{
  "reason": "License renewal pending"
}
```

---

### 7. Delete Pharmacy (Admin only)
**DELETE** `/api/v1/pharmacies/:id`

---

### 8. Search Pharmacies
**GET** `/api/v1/pharmacies/search`

**Query Parameters:**
- `q` (required): Search term

**Example:**
```
GET /api/v1/pharmacies/search?q=MediCare
```

---

## Laboratory Management

### 1. Register Laboratory (Admin only)
**POST** `/api/v1/laboratories`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body (JSON):**
```json
{
  "name": "Advanced Diagnostics Lab",
  "licenseNumber": "LAB-2024-001",
  "address": "456 Medical Plaza, City, State 12345",
  "phone": "1234567890",
  "email": "info@advanceddiagnostics.com",
  "emergencyPhone": "0987654321",
  "specializations": [
    "Blood Tests",
    "Radiology",
    "Pathology",
    "Microbiology"
  ],
  "is24Hours": false,
  "workingHours": {
    "monday": {
      "open": "07:00",
      "close": "19:00",
      "isClosed": false
    },
    "tuesday": {
      "open": "07:00",
      "close": "19:00",
      "isClosed": false
    },
    "wednesday": {
      "open": "07:00",
      "close": "19:00",
      "isClosed": false
    },
    "thursday": {
      "open": "07:00",
      "close": "19:00",
      "isClosed": false
    },
    "friday": {
      "open": "07:00",
      "close": "19:00",
      "isClosed": false
    },
    "saturday": {
      "open": "08:00",
      "close": "14:00",
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

**Response:**
```json
{
  "success": true,
  "message": "Laboratory registered successfully",
  "data": {
    "id": "673...",
    "name": "Advanced Diagnostics Lab",
    "licenseNumber": "LAB-2024-001",
    "status": "active"
  }
}
```

---

### 2. Get All Laboratories
**GET** `/api/v1/laboratories`

**Query Parameters:**
- `status` (optional): active, suspended, inactive
- `specialization` (optional)
- `page` (optional)
- `limit` (optional)

**Example:**
```
GET /api/v1/laboratories?status=active&specialization=Radiology
```

---

### 3. Get Laboratory by ID
**GET** `/api/v1/laboratories/:id`

**Example:**
```
GET /api/v1/laboratories/673f077f5b2c1aac6ae25adf90
```

---

### 4. Update Laboratory (Admin only)
**PUT** `/api/v1/laboratories/:id`

**Body (JSON):**
```json
{
  "phone": "1112223333",
  "email": "newemail@advanceddiagnostics.com",
  "specializations": ["Blood Tests", "Radiology", "Pathology", "Microbiology", "Genetics"]
}
```

---

### 5. Activate Laboratory (Admin only)
**PATCH** `/api/v1/laboratories/:id/activate`

---

### 6. Suspend Laboratory (Admin only)
**PATCH** `/api/v1/laboratories/:id/suspend`

**Body (JSON):**
```json
{
  "reason": "Quality audit pending"
}
```

---

### 7. Delete Laboratory (Admin only)
**DELETE** `/api/v1/laboratories/:id`

---

### 8. Search Laboratories
**GET** `/api/v1/laboratories/search`

**Query Parameters:**
- `q` (required): Search term

**Example:**
```
GET /api/v1/laboratories/search?q=Advanced
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ /* Array of items */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

---

## Authentication Notes

1. **Access Token**: Valid for 1 hour
2. **Refresh Token**: Valid for 7 days
3. **Token Refresh**: Use `/api/v1/auth/refresh` endpoint before access token expires

---

## Role-Based Access

| Endpoint | Admin | Doctor | Nurse | Reception | Patient | Pharmacist | Lab Tech |
|----------|-------|--------|-------|-----------|---------|------------|----------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Patient CRUD | ✅ | ✅ | ✅ | ✅ | 👁️ (own) | ❌ | ❌ |
| Appointments | ✅ | ✅ | ✅ | ✅ | 👁️ (own) | ❌ | ❌ |
| Consultations | ✅ | ✅ | 👁️ | 👁️ | 👁️ (own) | ❌ | ❌ |
| Prescriptions | ✅ | ✅ | 👁️ | 👁️ | 👁️ (own) | ✏️ (status) | ❌ |
| Pharmacy Mgmt | ✅ | ❌ | ❌ | ❌ | ❌ | 👁️ (own) | ❌ |
| Laboratory Mgmt | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 👁️ (own) |

**Legend:**
- ✅ Full access
- 👁️ Read-only access
- ✏️ Limited update access
- ❌ No access

---

## Testing Tips

### 1. Set Up Environment Variables
Create a Postman environment with these variables:
```
base_url: http://localhost:3000
access_token: (auto-set after login)
refresh_token: (auto-set after login)
admin_id: 673f077f5b2c1aac6ae25adf35
doctor_id: 673f077f5b2c1aac6ae25adf33
patient_id: (set after creating patient)
termin_id: (set after creating appointment)
```

### 2. Use Pre-request Scripts
Add this to your collection's pre-request script to automatically refresh tokens:
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

### 3. Test Authorization Header
Add this to all authenticated requests:
```
Authorization: Bearer {{access_token}}
```

---

## Troubleshooting

### 401 Unauthorized
- Check if access token is valid
- Try refreshing the token
- Re-login if refresh token is expired

### 403 Forbidden
- User doesn't have permission for this action
- Check role-based access table above

### 400 Bad Request
- Check request body format
- Validate required fields
- Ensure data types are correct

### 404 Not Found
- Verify the ID exists
- Check the endpoint URL

---

## Default Test Accounts

```json
{
  "admin": {
    "email": "admin@healthpulse.com",
    "password": "Admin@123",
    "role": "admin"
  },
  "doctor": {
    "email": "doctor@healthpulse.com",
    "password": "Doctor@123",
    "role": "doctor"
  },
  "nurse": {
    "email": "nurse@healthpulse.com",
    "password": "Nurse@123",
    "role": "nurse"
  },
  "reception": {
    "email": "reception@healthpulse.com",
    "password": "Reception@123",
    "role": "reception"
  }
}
```

---

**Last Updated:** November 2, 2024
**API Version:** 1.0
**Base URL:** http://localhost:3000
