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

### 📂 My Pharmacy

---

#### **1️⃣ View My Pharmacy Information**
```http
GET {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/pharmacies/{{pharmacy_id}}`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Pharmacy information retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('name');
    pm.expect(jsonData.data).to.have.property('licenseNumber');
    pm.expect(jsonData.data).to.have.property('workingHours');
    pm.expect(jsonData.data).to.have.property('address');
});

pm.test("Pharmacy has services", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.services) {
        pm.expect(jsonData.data.services).to.be.an('array');
    }
});

// Display pharmacy info
const pharmacy = pm.response.json().data;
console.log("Pharmacy Name:", pharmacy.name);
console.log("License:", pharmacy.licenseNumber);
console.log("Status:", pharmacy.status);
console.log("Services:", pharmacy.services?.join(", ") || "None");
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Pharmacy retrieved successfully",
  "data": {
    "_id": "6907...",
    "name": "Central Pharmacy",
    "licenseNumber": "PHARM-2024-001",
    "address": "123 Main St, City",
    "phone": "555-0100",
    "email": "info@centralpharmacy.com",
    "workingHours": {
      "monday": {"start": "08:00", "end": "20:00"},
      "tuesday": {"start": "08:00", "end": "20:00"}
    },
    "services": [
      "Prescription Dispensing",
      "Drug Counseling",
      "Immunizations"
    ],
    "status": "active",
    "verified": true
  }
}
```

---

### 📂 Prescription Management

---

#### **2️⃣ View All My Prescriptions**
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
- `?status=signed` - Filter by status (signed/dispensed)

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Prescriptions retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('object');
    
    // Save first prescription ID for later tests
    if (jsonData.data.prescriptions && jsonData.data.prescriptions.length > 0) {
        pm.environment.set("prescription_id", jsonData.data.prescriptions[0]._id);
        console.log("✅ Saved prescription_id:", jsonData.data.prescriptions[0]._id);
    }
});

// Display results
const data = pm.response.json().data;
console.log("Total Prescriptions:", data.prescriptions?.length || 0);
if (data.prescriptions && data.prescriptions.length > 0) {
    console.log("\nPrescriptions Summary:");
    data.prescriptions.forEach((rx, i) => {
        console.log(`${i+1}. ${rx.orderNumber} - ${rx.status} - Meds: ${rx.medications?.length || 0}`);
    });
}
```

---

#### **3️⃣ Get Prescription Details**
```http
GET {{base_url}}/api/v1/prescriptions/{{prescription_id}}
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/prescriptions/{{prescription_id}}`
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

pm.test("Medications array exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.medications).to.be.an('array');
    pm.expect(jsonData.data.medications.length).to.be.at.least(1);
});

pm.test("Patient and doctor info included", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('patientId');
    pm.expect(jsonData.data).to.have.property('doctorId');
});

// Display prescription details
const rx = pm.response.json().data;
console.log("\n📋 Prescription Details");
console.log("======================");
console.log("Order Number:", rx.orderNumber);
console.log("Status:", rx.status);
console.log("Patient:", rx.patientId?.fname, rx.patientId?.lname);
console.log("Doctor:", rx.doctorId?.fname, rx.doctorId?.lname);
console.log("\nMedications:");
rx.medications?.forEach((med, i) => {
    console.log(`${i+1}. ${med.medicationName}`);
    console.log(`   Dosage: ${med.dosage}`);
    console.log(`   Frequency: ${med.frequency}`);
    console.log(`   Duration: ${med.duration?.value} ${med.duration?.unit}`);
    console.log(`   Instructions: ${med.instructions}`);
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Prescription retrieved successfully",
  "data": {
    "_id": "6907...",
    "orderNumber": "RX-2025-123456",
    "patientId": {
      "_id": "6907...",
      "fname": "John",
      "lname": "Doe",
      "phone": "555-0123"
    },
    "doctorId": {
      "_id": "6907...",
      "fname": "Dr. Smith",
      "specialization": "Cardiology"
    },
    "medications": [
      {
        "_id": "6907...",
        "medicationName": "Lisinopril 10mg",
        "dosage": "10mg",
        "frequency": "once daily",
        "duration": {
          "value": 30,
          "unit": "days"
        },
        "quantity": 30,
        "instructions": "Take in the morning with food"
      }
    ],
    "status": "signed",
    "doctorNotes": "Monitor blood pressure weekly",
    "validUntil": "2026-02-01T...",
    "createdAt": "2025-11-03T..."
  }
}
```

---

#### **4️⃣ View Prescription Status**
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

pm.test("Status history exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.prescription.statusHistory).to.be.an('array');
});

// Display status
const data = pm.response.json().data;
console.log("Current Status:", data.currentStatus);
console.log("Order Number:", data.prescription.orderNumber);
console.log("\nStatus History:");
data.prescription.statusHistory?.forEach((h, i) => {
    console.log(`${i+1}. ${h.status} - ${new Date(h.timestamp).toLocaleString()}`);
});
```

---

### 📂 My Profile

---

#### **5️⃣ View My Profile**
```http
GET {{base_url}}/api/v1/users/me
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/users/me`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Pharmacist profile retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('email');
    pm.expect(jsonData.data).to.have.property('fname');
    pm.expect(jsonData.data).to.have.property('lname');
    pm.expect(jsonData.data.role).to.equal('pharmacist');
});

// Display profile
const user = pm.response.json().data;
console.log("Name:", user.fname, user.lname);
console.log("Email:", user.email);
console.log("Role:", user.role);
console.log("Phone:", user.phone);
```

---

#### **6️⃣ Update My Profile**
```http
PUT {{base_url}}/api/v1/users/me
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**✅ Ready to Test in Postman:**
1. Method: `PUT`
2. URL: `{{base_url}}/api/v1/users/me`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):

**Request Body:**
```json
{
  "phone": "1234567899",
  "licenseNumber": "PHAR-2024-002",
  "specialization": "Clinical Pharmacy",
  "certifications": ["PharmD", "RPh"],
  "experience": 10,
  "languagesSpoken": ["English", "Spanish"]
}
```

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Profile updated successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("updated");
});

console.log("✅ Profile updated successfully");
```

---

### 🎯 **Quick Test Checklist for Pharmacist Operations**

**Prerequisites:**
- ✅ Login as pharmacist and save `access_token`, `pharmacist_id`, and `pharmacy_id`
- ✅ Have prescriptions assigned to your pharmacy

**Test Sequence:**

1. **GET My Pharmacy Info** ✅
   - URL: `{{base_url}}/api/v1/pharmacies/{{pharmacy_id}}`
   - Should show pharmacy details

2. **GET All Prescriptions** ✅
   - URL: `{{base_url}}/api/v1/prescriptions`
   - Should return prescriptions (context-aware for pharmacists)
   - Save `prescription_id` from response

3. **GET Prescription Details** ✅
   - URL: `{{base_url}}/api/v1/prescriptions/{{prescription_id}}`
   - Should show full medication list

4. **GET Prescription Status** ✅
   - URL: `{{base_url}}/api/v1/prescriptions/{{prescription_id}}/status`
   - Should show status history

5. **GET My Profile** ✅
   - URL: `{{base_url}}/api/v1/users/me`
   - Should show pharmacist profile

6. **PUT Update Profile** ✅
   - URL: `{{base_url}}/api/v1/users/me`
   - Should update profile successfully

---

### 🔍 **Common Issues & Solutions**

**Issue 1: "Pharmacist not authorized"**
- **Solution**: Make sure you're logged in with pharmacist credentials
- **Solution**: Check that `access_token` is valid and not expired

**Issue 2: "Pharmacy not found"**
- **Solution**: Verify `pharmacy_id` is set correctly in environment
- **Solution**: Make sure pharmacist is associated with a pharmacy

**Issue 3: "Prescription not found"**
- **Solution**: Check that `prescription_id` exists and is accessible
- **Solution**: Pharmacists can only access prescriptions assigned to their pharmacy

**Issue 4: Empty prescriptions list**
- **Solution**: Ask a doctor to create and assign a prescription to your pharmacy
- **Solution**: Check if prescriptions are filtered by status

**Issue 5: Cannot update prescription status**
- **Solution**: Some status changes require specific permissions
- **Solution**: Check current prescription status allows the transition

---

### 📊 **Sample Test Flow in Postman**

```javascript
// 1. Login as Pharmacist (POST /api/v1/auth/login)
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("pharmacist_id", response.data.user.id);
    // Note: pharmacy_id should be in user profile
    console.log("✅ Pharmacist logged in");
}

// 2. Get My Pharmacy (GET /api/v1/pharmacies/{{pharmacy_id}})
if (pm.response.code === 200) {
    const response = pm.response.json();
    console.log("✅ Pharmacy:", response.data.name);
}

// 3. Get All Prescriptions (GET /api/v1/prescriptions)
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data.prescriptions && response.data.prescriptions.length > 0) {
        pm.environment.set("prescription_id", response.data.prescriptions[0]._id);
        console.log("✅ Found", response.data.prescriptions.length, "prescriptions");
    }
}

// 4. Get Prescription Details (GET /api/v1/prescriptions/{{prescription_id}})
if (pm.response.code === 200) {
    const response = pm.response.json();
    console.log("✅ Prescription:", response.data.orderNumber);
    console.log("   Medications:", response.data.medications.length);
}
```

---

### 💊 **Prescription Status Flow for Pharmacists**

| Status | Description | Pharmacist Action |
|--------|-------------|-------------------|
| `draft` | Being created by doctor | ❌ No action |
| `signed` | Ready for dispensing | ✅ Can view and prepare |
| `dispensed` | Medication given to patient | ✅ Completed |
| `cancelled` | Cancelled by doctor | ❌ No action |

---

### 📝 **Pharmacist Responsibilities**

1. **Prescription Review**
   - Verify prescription validity
   - Check medication interactions
   - Confirm patient allergies

2. **Dispensing**
   - Prepare medications accurately
   - Label containers correctly
   - Document dispensing

3. **Patient Counseling**
   - Explain medication usage
   - Discuss side effects
   - Answer patient questions

4. **Inventory Management**
   - Monitor stock levels
   - Track expiry dates
   - Order supplies

5. **Safety Checks**
   - Drug interaction screening
   - Dose verification
   - Patient identification

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