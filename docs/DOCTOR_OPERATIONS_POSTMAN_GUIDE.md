# 🏥 Doctor Operations - Consultations & Prescriptions Testing Guide

## 📋 Table of Contents
1. [Setup & Authentication](#setup--authentication)
2. [Consultations Management](#consultations-management)
3. [Prescriptions Management](#prescriptions-management)
4. [Complete Workflows](#complete-workflows)

---

## 🚀 Setup & Authentication

### Collection Variables
Add these to your Postman collection variables:

| Variable | Value |
|----------|-------|
| `baseUrl` | `http://localhost:3000/api/v1` |
| `doctorToken` | `` (auto-filled after login) |
| `patientToken` | `` (auto-filled after login) |
| `consultationId` | `` (auto-filled after creation) |
| `prescriptionId` | `` (auto-filled after creation) |
| `pharmacyId` | `` (get from pharmacy list) |
| `patientId` | `` (get from patients list) |

### Doctor Login
```http
POST {{baseUrl}}/auth/login
```
**Body:**
```json
{
    "email": "doctor@healthpulse.com",
    "password": "password123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("doctorToken", response.data.data.accessToken);
    console.log("✅ Doctor token saved");
}
```

### Patient Login
```http
POST {{baseUrl}}/auth/login
```
**Body:**
```json
{
    "email": "patient@healthpulse.com",
    "password": "password123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("patientToken", response.data.data.accessToken);
    pm.collectionVariables.set("patientId", response.data.data.user.id);
    console.log("✅ Patient token saved");
}
```

---

## 📁 FOLDER: 3. Doctor Operations - Consultations

### 3.1 Create Consultation
```http
POST {{baseUrl}}/consultations
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "patientId": "{{patientId}}",
    "consultationType": "in-person",
    "chiefComplaint": "Patient complains of persistent headache and fever for 3 days",
    "symptoms": [
        "headache",
        "fever",
        "body aches",
        "fatigue"
    ],
    "symptomsDuration": "3 days",
    "relevantMedicalHistory": "Patient has history of hypertension, currently on medication",
    "allergies": [
        {
            "allergen": "Penicillin",
            "reaction": "Skin rash",
            "severity": "moderate"
        }
    ],
    "currentMedications": [
        {
            "name": "Lisinopril",
            "dosage": "10mg",
            "frequency": "once daily"
        }
    ]
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("consultationId", response.data.data._id);
    console.log("✅ Consultation created:", response.data.data._id);
}
```

### 3.2 List My Consultations
```http
GET {{baseUrl}}/consultations
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Query Params (Optional):**
- `page=1`
- `limit=10`
- `status=in-progress`
- `patientId={{patientId}}`
- `startDate=2025-01-01`
- `endDate=2025-12-31`

### 3.3 Get Consultation Details
```http
GET {{baseUrl}}/consultations/{{consultationId}}
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

### 3.4 Update Consultation
```http
PUT {{baseUrl}}/consultations/{{consultationId}}
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "physicalExamination": {
        "generalAppearance": "Patient appears tired and in mild discomfort",
        "findings": "Temperature elevated at 38.5°C, mild dehydration noted"
    },
    "treatmentPlan": "Prescribe antipyretics and analgesics, recommend rest and hydration",
    "recommendations": [
        "Drink plenty of fluids (2-3 liters per day)",
        "Rest and avoid strenuous activity",
        "Monitor temperature regularly",
        "Return if symptoms worsen or persist beyond 5 days"
    ],
    "doctorNotes": "Patient responsive to treatment plan. Advised to follow up in 3 days if no improvement."
}
```

### 3.5 Add Vital Signs
```http
POST {{baseUrl}}/consultations/{{consultationId}}/vital-signs
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "bloodPressure": {
        "systolic": 135,
        "diastolic": 85
    },
    "heartRate": 88,
    "temperature": 38.5,
    "respiratoryRate": 18,
    "oxygenSaturation": 97,
    "weight": 75.5,
    "height": 175
}
```

**Note:** BMI is calculated automatically based on weight and height.

### 3.6 Add Diagnosis
```http
POST {{baseUrl}}/consultations/{{consultationId}}/diagnosis
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "condition": "Viral Upper Respiratory Tract Infection",
    "icdCode": "J06.9",
    "severity": "moderate",
    "notes": "Symptoms consistent with viral URTI. No bacterial infection indicators present. Expected to resolve within 5-7 days with symptomatic treatment."
}
```

**Alternative Examples:**

**Example 2 - Hypertension:**
```json
{
    "condition": "Essential Hypertension",
    "icdCode": "I10",
    "severity": "moderate",
    "notes": "Blood pressure elevated. Patient to continue current medication and monitor at home."
}
```

**Example 3 - Type 2 Diabetes:**
```json
{
    "condition": "Type 2 Diabetes Mellitus",
    "icdCode": "E11.9",
    "severity": "moderate",
    "notes": "Blood glucose levels elevated. Dietary modifications recommended along with medication."
}
```

### 3.7 Complete Consultation
```http
PATCH {{baseUrl}}/consultations/{{consultationId}}/complete
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Note:** Consultation must have at least one diagnosis before it can be completed.

### 3.8 Get Patient Consultation History
```http
GET {{baseUrl}}/consultations/patient/{{patientId}}/history
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Query Params (Optional):**
- `limit=20`
- `includeDrafts=false`

---

## 📁 FOLDER: 3. Doctor Operations - Prescriptions

### 4.1 Create Prescription
```http
POST {{baseUrl}}/prescriptions
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "consultationId": "{{consultationId}}",
    "patientId": "{{patientId}}",
    "diagnosis": "Viral Upper Respiratory Tract Infection",
    "diagnosisCode": "J06.9",
    "medications": [
        {
            "medicationName": "Paracetamol",
            "genericName": "Acetaminophen",
            "dosage": "500mg",
            "dosageForm": "tablet",
            "frequency": "every 6 hours",
            "route": "oral",
            "duration": {
                "value": 5,
                "unit": "days"
            },
            "quantity": 20,
            "instructions": "Take with food or water. Do not exceed 4 grams per day",
            "refillsAllowed": 0,
            "isSubstitutable": true
        },
        {
            "medicationName": "Ibuprofen",
            "genericName": "Ibuprofen",
            "dosage": "400mg",
            "dosageForm": "tablet",
            "frequency": "three times daily",
            "route": "oral",
            "duration": {
                "value": 5,
                "unit": "days"
            },
            "quantity": 15,
            "instructions": "Take after meals to avoid stomach upset",
            "refillsAllowed": 0,
            "isSubstitutable": true
        }
    ],
    "generalInstructions": "Complete the full course of medication. Do not stop even if you feel better.",
    "specialInstructions": [
        "Avoid alcohol while taking these medications",
        "Take medications with food",
        "Stay well hydrated"
    ],
    "warnings": [
        "Do not exceed recommended dosage",
        "Contact doctor if symptoms worsen",
        "Discontinue if allergic reaction occurs"
    ],
    "validUntil": "2025-04-28T23:59:59Z",
    "requiresFollowUp": true,
    "followUpDate": "2025-02-04T10:00:00Z",
    "doctorNotes": "Patient allergic to Penicillin - do not prescribe beta-lactam antibiotics"
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("prescriptionId", response.data.data._id);
    console.log("✅ Prescription created:", response.data.data.prescriptionNumber);
}
```

### 4.2 Add Medication to Prescription
```http
POST {{baseUrl}}/prescriptions/{{prescriptionId}}/medications
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "medicationName": "Vitamin C",
    "genericName": "Ascorbic Acid",
    "dosage": "1000mg",
    "dosageForm": "tablet",
    "frequency": "once daily",
    "route": "oral",
    "duration": {
        "value": 7,
        "unit": "days"
    },
    "quantity": 7,
    "instructions": "Take with breakfast",
    "refillsAllowed": 0,
    "isSubstitutable": true
}
```

**Note:** Can only add medications to prescriptions with status "draft"

### 4.3 List My Prescriptions
```http
GET {{baseUrl}}/prescriptions
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Query Params (Optional):**
- `page=1`
- `limit=10`
- `status=active`
- `patientId={{patientId}}`
- `startDate=2025-01-01`
- `endDate=2025-12-31`

### 4.4 Get Prescription Details
```http
GET {{baseUrl}}/prescriptions/{{prescriptionId}}
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

### 4.5 Update Prescription (Draft Only)
```http
PUT {{baseUrl}}/prescriptions/{{prescriptionId}}
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "generalInstructions": "UPDATED: Complete the full course of medication even if symptoms improve.",
    "specialInstructions": [
        "Avoid alcohol while taking these medications",
        "Take all medications with food",
        "Stay well hydrated - drink at least 2 liters of water daily",
        "Avoid driving if feeling drowsy"
    ],
    "warnings": [
        "Do not exceed recommended dosage",
        "Contact doctor immediately if symptoms worsen or new symptoms appear",
        "Discontinue if allergic reaction occurs and seek emergency care"
    ],
    "requiresFollowUp": true,
    "followUpDate": "2025-02-05T14:00:00Z"
}
```

**Note:** Can only update prescriptions with status "draft"

### 4.6 Sign Prescription
```http
PATCH {{baseUrl}}/prescriptions/{{prescriptionId}}/sign
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Note:** 
- Prescription must have at least one medication
- Once signed, prescription cannot be edited (status changes to "active")
- Digital signature is generated automatically

### 4.7 Assign to Pharmacy
```http
PATCH {{baseUrl}}/prescriptions/{{prescriptionId}}/assign-pharmacy
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "pharmacyId": "{{pharmacyId}}"
}
```

**Note:** 
- Prescription must be signed before assigning to pharmacy
- Pharmacy must be active

**To get pharmacy ID first:**
```http
GET {{baseUrl}}/pharmacies?status=active&limit=5
```

### 4.8 View Prescription Status
```http
GET {{baseUrl}}/prescriptions/{{prescriptionId}}/status
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
```

**Response Example:**
```json
{
    "success": true,
    "data": {
        "prescriptionNumber": "RX2025123456",
        "status": "active",
        "dispenseStatus": "not-dispensed",
        "isSigned": true,
        "isExpired": false,
        "validUntil": "2025-04-28T23:59:59.000Z",
        "assignedPharmacy": {
            "_id": "...",
            "name": "Pharmacie Al Shifa",
            "contact": {
                "phone": "0512345678",
                "email": "contact@alshifa.ma"
            }
        }
    }
}
```

### 4.9 Cancel Prescription
```http
PATCH {{baseUrl}}/prescriptions/{{prescriptionId}}/cancel
```
**Headers:**
```
Authorization: Bearer {{doctorToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "reason": "Patient experienced adverse reaction to one of the medications. New prescription will be issued with alternative medication."
}
```

**Note:** Cannot cancel prescriptions that have already been dispensed

---

## 📁 FOLDER: Complete Workflows

### Workflow 1: Complete Consultation with Prescription

**Step 1: Create Consultation**
```http
POST {{baseUrl}}/consultations
```
```json
{
    "patientId": "{{patientId}}",
    "consultationType": "in-person",
    "chiefComplaint": "Severe migraine with nausea",
    "symptoms": ["headache", "nausea", "sensitivity to light", "vomiting"],
    "symptomsDuration": "2 days"
}
```

**Step 2: Add Vital Signs**
```http
POST {{baseUrl}}/consultations/{{consultationId}}/vital-signs
```
```json
{
    "bloodPressure": {"systolic": 130, "diastolic": 80},
    "heartRate": 82,
    "temperature": 36.8,
    "weight": 68,
    "height": 165
}
```

**Step 3: Add Diagnosis**
```http
POST {{baseUrl}}/consultations/{{consultationId}}/diagnosis
```
```json
{
    "condition": "Migraine with aura",
    "icdCode": "G43.1",
    "severity": "severe",
    "notes": "Patient experiencing severe migraine attacks. Prescribing preventive and acute medications."
}
```

**Step 4: Create Prescription**
```http
POST {{baseUrl}}/prescriptions
```
```json
{
    "consultationId": "{{consultationId}}",
    "patientId": "{{patientId}}",
    "diagnosis": "Migraine with aura",
    "diagnosisCode": "G43.1",
    "medications": [
        {
            "medicationName": "Sumatriptan",
            "dosage": "50mg",
            "dosageForm": "tablet",
            "frequency": "as needed for migraine",
            "route": "oral",
            "duration": {"value": 30, "unit": "days"},
            "quantity": 9,
            "instructions": "Take at onset of migraine. Can repeat after 2 hours if needed. Max 2 doses per 24 hours.",
            "refillsAllowed": 2
        }
    ],
    "generalInstructions": "Take medication at first sign of migraine for best results"
}
```

**Step 5: Sign Prescription**
```http
PATCH {{baseUrl}}/prescriptions/{{prescriptionId}}/sign
```

**Step 6: Assign to Pharmacy**
```http
PATCH {{baseUrl}}/prescriptions/{{prescriptionId}}/assign-pharmacy
```
```json
{
    "pharmacyId": "{{pharmacyId}}"
}
```

**Step 7: Complete Consultation**
```http
PATCH {{baseUrl}}/consultations/{{consultationId}}/complete
```

---

### Workflow 2: Chronic Disease Management

**Example: Type 2 Diabetes Follow-up**

**Create Consultation:**
```json
{
    "patientId": "{{patientId}}",
    "consultationType": "follow-up",
    "chiefComplaint": "Routine diabetes check-up and medication review",
    "relevantMedicalHistory": "Type 2 Diabetes diagnosed 3 years ago, on Metformin",
    "currentMedications": [
        {
            "name": "Metformin",
            "dosage": "500mg",
            "frequency": "twice daily"
        }
    ]
}
```

**Add Vital Signs:**
```json
{
    "bloodPressure": {"systolic": 138, "diastolic": 88},
    "heartRate": 78,
    "temperature": 36.7,
    "weight": 82,
    "height": 170
}
```

**Add Diagnosis:**
```json
{
    "condition": "Type 2 Diabetes Mellitus - under control",
    "icdCode": "E11.9",
    "severity": "moderate",
    "notes": "HbA1c within target range. Continue current medication. Dietary advice given."
}
```

**Create Prescription:**
```json
{
    "consultationId": "{{consultationId}}",
    "patientId": "{{patientId}}",
    "diagnosis": "Type 2 Diabetes Mellitus",
    "diagnosisCode": "E11.9",
    "medications": [
        {
            "medicationName": "Metformin",
            "dosage": "500mg",
            "dosageForm": "tablet",
            "frequency": "twice daily",
            "route": "oral",
            "duration": {"value": 90, "unit": "days"},
            "quantity": 180,
            "instructions": "Take with meals to reduce stomach upset",
            "refillsAllowed": 3
        }
    ],
    "requiresFollowUp": true,
    "followUpDate": "2025-05-28T10:00:00Z",
    "generalInstructions": "Continue medication as prescribed. Monitor blood glucose levels daily."
}
```

---

## 📊 Patient View - Prescriptions

### Get My Prescriptions (Patient)
```http
GET {{baseUrl}}/prescriptions/my-prescriptions
```
**Headers:**
```
Authorization: Bearer {{patientToken}}
```

**Query Params:**
- `page=1`
- `limit=10`
- `status=active`

### View My Prescription Details (Patient)
```http
GET {{baseUrl}}/prescriptions/{{prescriptionId}}
```
**Headers:**
```
Authorization: Bearer {{patientToken}}
```

### View My Consultation (Patient)
```http
GET {{baseUrl}}/consultations/{{consultationId}}
```
**Headers:**
```
Authorization: Bearer {{patientToken}}
```

**Note:** Patients can only view their own consultations and prescriptions. Private doctor notes are hidden from patient view.

---

## 🧪 Testing Scenarios

### Test 1: Permission Validation

**Scenario:** Patient tries to create consultation (should fail)
```http
POST {{baseUrl}}/consultations
Authorization: Bearer {{patientToken}}
```
**Expected:** 403 Forbidden

### Test 2: Signing Validation

**Scenario:** Try to assign unsigned prescription to pharmacy (should fail)
```http
PATCH {{baseUrl}}/prescriptions/{{prescriptionId}}/assign-pharmacy
```
**Expected:** 400 Bad Request - "Prescription must be signed first"

### Test 3: Update Restrictions

**Scenario:** Try to update prescription after signing (should fail)
```http
PUT {{baseUrl}}/prescriptions/{{prescriptionId}}
```
**Expected:** 400 Bad Request - "Can only update draft prescriptions"

### Test 4: Completion Validation

**Scenario:** Try to complete consultation without diagnosis (should fail)
```http
PATCH {{baseUrl}}/consultations/{{consultationId}}/complete
```
**Expected:** 400 Bad Request - "Cannot complete consultation without diagnosis"

---

## 📋 Collection-Level Test Scripts

Add to your collection's **Tests** tab:

```javascript
// Verify response structure
pm.test("Response has success property", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property("success");
});

// Log important information
if (pm.response.code === 201 || pm.response.code === 200) {
    const response = pm.response.json();
    console.log("📊 Response:", JSON.stringify(response.data, null, 2));
}

// Performance check
pm.test("Response time under 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

## 🎯 Quick Reference - Status Codes

| Status | Consultation | Prescription |
|--------|-------------|--------------|
| Initial | `scheduled` | `draft` |
| In Progress | `in-progress` | `draft` |
| Signed | - | `active` |
| Completed | `completed` | `active` |
| Cancelled | `cancelled` | `cancelled` |
| Dispensed | - | `dispensed` |

---

## 💊 Common Medications Examples

### Antibiotics
```json
{
    "medicationName": "Amoxicillin",
    "dosage": "500mg",
    "dosageForm": "capsule",
    "frequency": "three times daily",
    "duration": {"value": 7, "unit": "days"}
}
```

### Pain Relief
```json
{
    "medicationName": "Tramadol",
    "dosage": "50mg",
    "dosageForm": "tablet",
    "frequency": "every 6 hours as needed",
    "duration": {"value": 5, "unit": "days"},
    "isControlledSubstance": true,
    "controlledSubstanceClass": "IV"
}
```

### Chronic Conditions
```json
{
    "medicationName": "Lisinopril",
    "dosage": "10mg",
    "dosageForm": "tablet",
    "frequency": "once daily",
    "duration": {"value": 90, "unit": "days"},
    "refillsAllowed": 3
}
```

---

**🎉 Complete! You now have a comprehensive testing suite for consultations and prescriptions!** 🚀

All endpoints are protected with proper authentication and authorization. Doctors can manage consultations and prescriptions, while patients can view their own records.
