# HealthPulse API - Pharmacist Operations Collection

## 📋 Pharmacist Collection Overview

This document provides detailed API documentation for all pharmacist operations in the HealthPulse system. Pharmacists can manage prescriptions, track dispensing, and handle their pharmacy operations.

---

## 🔐 Authentication

### Pharmacist Login
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
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
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
    pm.environment.set("pharmacist_id", response.data.user.id);
    pm.environment.set("pharmacy_id", response.data.user.pharmacyId);
}
```

---

## 📁 7. Pharmacist Operations ✨ NEW

### 📂 Authentication

#### **Pharmacist Login**
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "pharmacist@healthpulse.com",
  "password": "Pharmacist@123"
}
```

#### **View My Pharmacy Info**
```http
GET {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Pharmacy information retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('name');
    pm.expect(jsonData.data).to.have.property('licenseNumber');
    pm.expect(jsonData.data).to.have.property('workingHours');
});
```

---

### 📂 Prescription Management

#### **View Assigned Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions/pharmacy/{{pharmacy_id}}?status=assigned&page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `status` (optional): Filter by status (assigned/signed/in_preparation/dispensed)
- `page` (optional): Page number
- `limit` (optional): Items per page
- `priority` (optional): Filter by priority (urgent/normal/routine)
- `patientName` (optional): Search by patient name
- `doctorName` (optional): Filter by prescribing doctor
- `medicationName` (optional): Search by medication name

**Test Script:**
```javascript
pm.test("Assigned prescriptions for pharmacy", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('prescriptions');
    jsonData.data.prescriptions.forEach(prescription => {
        pm.expect(prescription.pharmacyId).to.equal(pm.environment.get("pharmacy_id"));
    });
});
```

#### **View Pending Prescriptions**
```http
GET {{base_url}}/api/v1/prescriptions/pharmacy/{{pharmacy_id}}?status=signed&page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- Same as above, but typically filtered for signed prescriptions awaiting processing

#### **Get Prescription Details**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Prescription belongs to pharmacy", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.pharmacyId).to.equal(pm.environment.get("pharmacy_id"));
});

pm.test("Prescription includes medication details", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('medications');
    pm.expect(jsonData.data.medications).to.be.an('array');
    pm.expect(jsonData.data.medications[0]).to.have.property('name');
    pm.expect(jsonData.data.medications[0]).to.have.property('dosage');
});
```

#### **Update Prescription Status**

##### **Mark as In Preparation**
```http
PATCH {{base_url}}/api/v1/prescriptions/{{prescription_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_preparation",
  "pharmacistId": "{{pharmacist_id}}",
  "notes": "Prescription being prepared. All medications available in stock.",
  "estimatedCompletionTime": "2024-11-18T16:30:00Z",
  "medicationChecks": [
    {
      "medicationId": "med_001",
      "checked": true,
      "stockAvailable": true,
      "expiryDate": "2025-06-15",
      "batchNumber": "BATCH123"
    }
  ]
}
```

##### **Mark as Dispensed**
```http
PATCH {{base_url}}/api/v1/prescriptions/{{prescription_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "dispensed",
  "pharmacistId": "{{pharmacist_id}}",
  "dispensedAt": "2024-11-18T16:45:00Z",
  "dispensedTo": "Patient",
  "identificationVerified": true,
  "copayCollected": true,
  "copayAmount": 15.50,
  "paymentMethod": "insurance_copay",
  "counselingProvided": true,
  "counselingNotes": "Patient counseled on medication timing and potential side effects",
  "dispensedMedications": [
    {
      "medicationId": "med_001",
      "quantityDispensed": 30,
      "batchNumber": "BATCH123",
      "expiryDate": "2025-06-15",
      "instructions": "Take one tablet twice daily with food"
    }
  ]
}
```

**Test Script:**
```javascript
pm.test("Prescription status updated successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.status).to.equal("dispensed");
    pm.expect(jsonData.data.dispensedBy).to.equal(pm.environment.get("pharmacist_id"));
});
```

#### **Report Medication Unavailable**
```http
PATCH {{base_url}}/api/v1/prescriptions/{{prescription_id}}/medication-unavailable
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "unavailableMedications": [
    {
      "medicationName": "Lisinopril 10mg",
      "reason": "out_of_stock",
      "expectedRestockDate": "2024-11-25",
      "alternativeSuggested": {
        "name": "Lisinopril 5mg",
        "reason": "Lower dose available, patient can take two tablets"
      }
    }
  ],
  "pharmacistId": "{{pharmacist_id}}",
  "notifyDoctor": true,
  "notifyPatient": true,
  "notes": "Contacted supplier, expected delivery by end of week"
}
```

#### **View Dispensing History**
```http
GET {{base_url}}/api/v1/prescriptions/pharmacy/{{pharmacy_id}}?status=dispensed&page=1&limit=20
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `fromDate` (optional): Start date for history (YYYY-MM-DD)
- `toDate` (optional): End date for history (YYYY-MM-DD)
- `pharmacistId` (optional): Filter by specific pharmacist
- `patientName` (optional): Search by patient name
- `medicationName` (optional): Search by medication name

---

### 📂 Inventory Management (Pharmacist-specific)

#### **Check Medication Stock**
```http
GET {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/inventory?medication={{medication_name}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `medication` (optional): Search specific medication
- `lowStock` (optional): Show only low stock items
- `expiringSoon` (optional): Show items expiring within specified days
- `category` (optional): Filter by medication category

#### **Update Medication Stock**
```http
PUT {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/inventory/{{medication_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 150,
  "batchNumber": "BATCH456",
  "expiryDate": "2025-08-20",
  "costPrice": 45.50,
  "sellingPrice": 67.99,
  "supplier": "MedSupply Corp",
  "updatedBy": "{{pharmacist_id}}",
  "notes": "New stock received from supplier"
}
```

#### **Report Low Stock**
```http
POST {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/inventory/low-stock-alert
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "medicationId": "med_001",
  "currentStock": 5,
  "minimumRequired": 50,
  "urgency": "high",
  "reportedBy": "{{pharmacist_id}}",
  "supplierContact": "supplier@medsupply.com"
}
```

---

### 📂 Patient Counseling (Pharmacist-specific)

#### **Record Patient Counseling**
```http
POST {{base_url}}/api/v1/prescriptions/{{prescription_id}}/counseling
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "pharmacistId": "{{pharmacist_id}}",
  "counselingDate": "2024-11-18T16:45:00Z",
  "counselingType": "medication_education",
  "topicsCovered": [
    "Proper dosage timing",
    "Food interactions",
    "Side effects to watch for",
    "Storage instructions"
  ],
  "patientQuestions": [
    "Can I take this with my morning coffee?",
    "What should I do if I miss a dose?"
  ],
  "patientUnderstanding": "good",
  "followUpRequired": false,
  "duration": 15,
  "notes": "Patient demonstrated good understanding of medication regimen"
}
```

#### **View Counseling History**
```http
GET {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/counseling-history?pharmacistId={{pharmacist_id}}
Authorization: Bearer {{access_token}}
```

---

### 📂 Drug Interaction Checks (Pharmacist-specific)

#### **Check Drug Interactions**
```http
POST {{base_url}}/api/v1/prescriptions/{{prescription_id}}/interaction-check
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "newMedications": [
    {
      "name": "Warfarin 5mg",
      "dosage": "5mg",
      "frequency": "once daily"
    }
  ],
  "currentMedications": [
    {
      "name": "Aspirin 81mg",
      "dosage": "81mg",
      "frequency": "once daily"
    }
  ]
}
```

**Test Script:**
```javascript
pm.test("Drug interaction check completed", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('interactions');
    pm.expect(jsonData.data).to.have.property('severity');
});
```

#### **Report Drug Interaction**
```http
POST {{base_url}}/api/v1/prescriptions/{{prescription_id}}/interaction-report
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "interactionType": "major",
  "medicationsInvolved": ["Warfarin", "Aspirin"],
  "severity": "high",
  "clinicalEffect": "Increased bleeding risk",
  "recommendation": "Consider alternative anticoagulant or adjust dosing",
  "pharmacistId": "{{pharmacist_id}}",
  "notifyDoctor": true,
  "notifyPatient": true
}
```

---

### 📂 My Profile

#### **View My Profile**
```http
GET {{base_url}}/api/v1/users/{{pharmacist_id}}
Authorization: Bearer {{access_token}}
```

#### **Update My Profile**
```http
PUT {{base_url}}/api/v1/users/{{pharmacist_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "1234567899",
  "licenseNumber": "PHAR-2024-002",
  "pharmacyId": "{{pharmacy_id}}",
  "specialization": "Clinical Pharmacy and Drug Therapy",
  "certifications": ["PharmD", "RPh", "BCPS"],
  "experience": 10,
  "workingHours": {
    "monday": {"start": "08:00", "end": "18:00"},
    "tuesday": {"start": "08:00", "end": "18:00"},
    "wednesday": {"start": "08:00", "end": "18:00"},
    "thursday": {"start": "08:00", "end": "18:00"},
    "friday": {"start": "08:00", "end": "18:00"},
    "saturday": {"start": "09:00", "end": "17:00"}
  },
  "languagesSpoken": ["English", "Spanish"],
  "specialAreas": ["Diabetes Management", "Pain Management", "Immunizations"]
}
```

#### **Change Password**
```http
PUT {{base_url}}/api/v1/users/{{pharmacist_id}}/password
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "Pharmacist@123",
  "newPassword": "NewPharmacist@456",
  "confirmPassword": "NewPharmacist@456"
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

### Pharmacist-specific Tests
```javascript
pm.test("Pharmacist has required permissions", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.user) {
        pm.expect(jsonData.data.user.role.name).to.equal('pharmacist');
    }
});

pm.test("Prescription belongs to pharmacist's pharmacy", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.pharmacyId) {
        pm.expect(jsonData.data.pharmacyId).to.equal(pm.environment.get("pharmacy_id"));
    }
});

pm.test("Dispensing recorded by pharmacist", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.dispensedBy) {
        pm.expect(jsonData.data.dispensedBy).to.equal(pm.environment.get("pharmacist_id"));
    }
});
```

### Prescription Validation Tests
```javascript
pm.test("Prescription has required medication details", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.medications) {
        jsonData.data.medications.forEach(medication => {
            pm.expect(medication).to.have.property('name');
            pm.expect(medication).to.have.property('dosage');
            pm.expect(medication).to.have.property('instructions');
        });
    }
});

pm.test("Drug interaction check results", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.interactions) {
        pm.expect(jsonData.data.interactions).to.be.an('array');
        pm.expect(jsonData.data).to.have.property('severity');
    }
});
```

---

## 🔧 Environment Variables

Required variables for pharmacist operations:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "pharmacist_id": "",
  "pharmacy_id": "",
  "prescription_id": "",
  "medication_id": "",
  "patient_id": "",
  "counseling_id": "",
  "interaction_check_id": ""
}
```

---

## 📝 Notes

1. **Prescription Management**: Full lifecycle management from assignment to dispensing
2. **Drug Safety**: Comprehensive interaction checking and safety protocols
3. **Inventory**: Real-time stock management and low stock alerts
4. **Patient Care**: Detailed counseling and patient education documentation
5. **Compliance**: All activities logged for regulatory compliance
6. **Quality Control**: Batch tracking and expiry date management
7. **Communication**: Direct coordination with doctors and patients

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Pharmacist Operations