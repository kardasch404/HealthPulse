# HealthPulse API - Admin Operations Collection

## 📋 Admin Collection Overview

This document provides detailed API documentation for all admin operations in the HealthPulse system. Admin users have full system access and can manage all aspects of the platform.

---

## 🔐 Authentication

### Admin Login
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
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

---

## 📁 2. Admin Operations

### 📂 User Management

#### **Create Doctor Account**
```http
POST {{base_url}}/api/v1/users
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Dr. John",
  "lastName": "Smith",
  "email": "doctor.smith@healthpulse.com",
  "password": "Doctor@123",
  "roleId": "{{role_doctor}}",
  "specialization": "Cardiology",
  "licenseNumber": "DOC-2024-001",
  "phone": "1234567890",
  "department": "Cardiology",
  "experience": 10,
  "qualifications": "MD, FACC"
}
```

**Test Script:**
```javascript
pm.test("Doctor created successfully", function () {
    pm.response.to.have.status(201);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.environment.set("doctor_id", jsonData.data.id);
});
```

#### **Create Nurse Account**
```http
POST {{base_url}}/api/v1/users
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "nurse.sarah@healthpulse.com",
  "password": "Nurse@123",
  "roleId": "{{role_nurse}}",
  "phone": "1234567891",
  "department": "General",
  "licenseNumber": "NUR-2024-001",
  "shift": "Day",
  "experience": 5
}
```

#### **Create Reception Account**
```http
POST {{base_url}}/api/v1/users
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Emily",
  "lastName": "Davis",
  "email": "reception.emily@healthpulse.com",
  "password": "Reception@123",
  "roleId": "{{role_reception}}",
  "phone": "1234567892",
  "department": "Front Desk",
  "shift": "Day"
}
```

#### **Create Patient Account**
```http
POST {{base_url}}/api/v1/users
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Michael",
  "lastName": "Brown",
  "email": "patient.michael@gmail.com",
  "password": "Patient@123",
  "roleId": "{{role_patient}}",
  "phone": "1234567893",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "address": "123 Main St, City, State 12345",
  "emergencyContact": {
    "name": "Jane Brown",
    "phone": "1234567894",
    "relationship": "Wife"
  },
  "bloodType": "O+",
  "allergies": ["Penicillin"],
  "medicalHistory": ["Hypertension"]
}
```

#### **Create Pharmacist Account** ✨ NEW
```http
POST {{base_url}}/api/v1/users
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "David",
  "lastName": "Wilson",
  "email": "pharmacist.david@healthpulse.com",
  "password": "Pharmacist@123",
  "roleId": "{{role_pharmacist}}",
  "phone": "1234567895",
  "licenseNumber": "PHAR-2024-001",
  "pharmacyId": "{{pharmacy_id}}",
  "specialization": "Clinical Pharmacy",
  "experience": 8
}
```

#### **Create Lab Technician Account** ✨ NEW
```http
POST {{base_url}}/api/v1/users
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Lisa",
  "lastName": "Garcia",
  "email": "labtech.lisa@healthpulse.com",
  "password": "LabTech@123",
  "roleId": "{{role_lab_technician}}",
  "phone": "1234567896",
  "licenseNumber": "LAB-2024-001",
  "laboratoryId": "{{laboratory_id}}",
  "specialization": "Clinical Chemistry",
  "certifications": ["MLT", "ASCP"]
}
```

#### **List All Users**
```http
GET {{base_url}}/api/v1/users?page=1&limit=10&role={{role_name}}&status=active
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role name
- `status` (optional): Filter by status (active/inactive)
- `search` (optional): Search by name or email

#### **Get User Details**
```http
GET {{base_url}}/api/v1/users/{{user_id}}
Authorization: Bearer {{access_token}}
```

#### **Update User**
```http
PUT {{base_url}}/api/v1/users/{{user_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "phone": "9876543210",
  "department": "Updated Department"
}
```

#### **Suspend User**
```http
PATCH {{base_url}}/api/v1/users/{{user_id}}/suspend
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Policy violation",
  "suspensionDuration": "30 days"
}
```

#### **Activate User**
```http
PATCH {{base_url}}/api/v1/users/{{user_id}}/activate
Authorization: Bearer {{access_token}}
```

#### **Delete User**
```http
DELETE {{base_url}}/api/v1/users/{{user_id}}
Authorization: Bearer {{access_token}}
```

---

### 📂 Role Management

#### **List All Roles**
```http
GET {{base_url}}/api/v1/roles
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    const roles = response.data;
    
    roles.forEach(role => {
        switch(role.name.toLowerCase()) {
            case 'admin':
                pm.environment.set("role_admin", role.id);
                break;
            case 'doctor':
                pm.environment.set("role_doctor", role.id);
                break;
            case 'nurse':
                pm.environment.set("role_nurse", role.id);
                break;
            case 'reception':
                pm.environment.set("role_reception", role.id);
                break;
            case 'patient':
                pm.environment.set("role_patient", role.id);
                break;
            case 'pharmacist':
                pm.environment.set("role_pharmacist", role.id);
                break;
            case 'lab_technician':
                pm.environment.set("role_lab_technician", role.id);
                break;
        }
    });
}
```

#### **Get Role Details**
```http
GET {{base_url}}/api/v1/roles/{{role_id}}
Authorization: Bearer {{access_token}}
```

#### **Update Role Permissions**
```http
PUT {{base_url}}/api/v1/roles/{{role_id}}/permissions
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "permissions": [
    "users:read",
    "users:write",
    "patients:read",
    "patients:write",
    "appointments:read",
    "appointments:write"
  ]
}
```

#### **Create Custom Role**
```http
POST {{base_url}}/api/v1/roles
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Specialist",
  "description": "Medical Specialist Role",
  "permissions": [
    "patients:read",
    "consultations:read",
    "consultations:write",
    "prescriptions:read",
    "prescriptions:write"
  ]
}
```

---

### 📂 Pharmacy Management ✨ NEW

#### **Register Partner Pharmacy**
```http
POST {{base_url}}/api/v1/pharmacies
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Chifa Pharmacy",
  "licenseNumber": "PHR-2024-001",
  "contact": {
    "phone": "+212661234567",
    "email": "info@chifa-pharmacy.com",
    "emergencyPhone": "+212612345678",
    "website": "https://chifa-pharmacy.com"
  },
  "address": {
    "street": "123 Main Street",
    "city": "Casablanca",
    "state": "Casablanca-Settat",
    "zipCode": "20000",
    "country": "Morocco",
    "coordinates": {
      "latitude": 33.5731,
      "longitude": -7.5898
    }
  },
  "operatingHours": [
    {
      "day": "monday",
      "openTime": "08:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "day": "tuesday",
      "openTime": "08:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "day": "wednesday",
      "openTime": "08:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "day": "thursday",
      "openTime": "08:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "day": "friday",
      "openTime": "08:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "day": "saturday",
      "openTime": "09:00",
      "closeTime": "18:00",
      "isClosed": false
    },
    {
      "day": "sunday",
      "openTime": "00:00",
      "closeTime": "00:00",
      "isClosed": true
    }
  ],
  "services": ["prescription_filling", "consultation", "home_delivery", "vaccination"],
  "deliveryService": {
    "available": true,
    "deliveryRadius": 10,
    "deliveryFee": 25,
    "freeDeliveryMinimum": 200,
    "estimatedTime": "30-45 minutes"
  },
  "insuranceAccepted": ["CNSS", "CNOPS", "Private"]
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("pharmacy_id", response.data.id);
}
```

#### **List All Pharmacies**
```http
GET {{base_url}}/api/v1/pharmacies?status=active&page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `status` (optional): Filter by status (active/inactive/suspended)
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or license number
- `is24Hours` (optional): Filter 24-hour pharmacies

#### **Get Pharmacy Details**
```http
GET {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
```

#### **Update Pharmacy Info**
```http
PUT {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "1234567899",
  "email": "updated@medicare-pharmacy.com",
  "workingHours": {
    "monday": {
      "open": "07:00",
      "close": "21:00",
      "isClosed": false
    }
  }
}
```

#### **Activate Pharmacy**
```http
PATCH {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/activate
Authorization: Bearer {{access_token}}
```

#### **Suspend Pharmacy**
```http
PATCH {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/suspend
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "License renewal pending",
  "suspensionDuration": "30 days"
}
```

#### **Delete Pharmacy**
```http
DELETE {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
```

---

### 📂 Laboratory Management ✨ NEW

#### **Register Partner Laboratory**
```http
POST {{base_url}}/api/v1/laboratories
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Advanced Diagnostics Lab",
  "licenseNumber": "LAB-2024-001",
  "address": "456 Science Blvd, City, State 12345",
  "phone": "1234567800",
  "email": "info@advanced-diagnostics.com",
  "emergencyPhone": "0987654320",
  "accreditation": "CAP",
  "workingHours": {
    "monday": {
      "open": "06:00",
      "close": "22:00",
      "isClosed": false
    },
    "tuesday": {
      "open": "06:00",
      "close": "22:00",
      "isClosed": false
    },
    "wednesday": {
      "open": "06:00",
      "close": "22:00",
      "isClosed": false
    },
    "thursday": {
      "open": "06:00",
      "close": "22:00",
      "isClosed": false
    },
    "friday": {
      "open": "06:00",
      "close": "22:00",
      "isClosed": false
    },
    "saturday": {
      "open": "07:00",
      "close": "20:00",
      "isClosed": false
    },
    "sunday": {
      "open": "08:00",
      "close": "18:00",
      "isClosed": false
    }
  },
  "services": [
    "Blood Tests",
    "Urine Analysis",
    "X-Ray",
    "CT Scan",
    "MRI",
    "Ultrasound",
    "ECG",
    "Pathology"
  ],
  "coordinates": {
    "latitude": 40.7589,
    "longitude": -73.9851
  },
  "turnaroundTime": {
    "routine": "24 hours",
    "urgent": "2 hours",
    "stat": "30 minutes"
  }
}
```

**Test Script:**
```javascript
// Enhanced laboratory registration test
pm.test("Laboratory registration successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response structure validation", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData).to.have.property('message');
});

pm.test("Laboratory data validation", function () {
    const jsonData = pm.response.json();
    const lab = jsonData.data;
    pm.expect(lab).to.have.property('name');
    pm.expect(lab).to.have.property('licenseNumber');
    pm.expect(lab).to.have.property('laboratoryId');
    pm.expect(lab).to.have.property('status');
    pm.expect(lab.status).to.equal('active');
});

pm.test("Save laboratory ID to environment", function () {
    if (pm.response.code === 201) {
        const response = pm.response.json();
        pm.environment.set("laboratory_id", response.data._id || response.data.id);
        console.log("🏥 Laboratory ID saved:", response.data._id || response.data.id);
    }
});

pm.test("Working hours validation", function () {
    const jsonData = pm.response.json();
    const workingHours = jsonData.data.workingHours;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        pm.expect(workingHours).to.have.property(day);
        pm.expect(workingHours[day]).to.have.property('open');
        pm.expect(workingHours[day]).to.have.property('close');
        pm.expect(workingHours[day]).to.have.property('isClosed');
    });
});

pm.test("Services array validation", function () {
    const jsonData = pm.response.json();
    const services = jsonData.data.services;
    pm.expect(services).to.be.an('array');
    pm.expect(services.length).to.be.at.least(5);
    console.log("🔬 Laboratory offers", services.length, "services");
});
```

#### **List All Laboratories**
```http
GET {{base_url}}/api/v1/laboratories?status=active&page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `status` (optional): Filter by status (active/inactive/suspended)
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or license number
- `accreditation` (optional): Filter by accreditation type

**Test Script:**
```javascript
pm.test("Laboratories list retrieved successfully", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Response structure validation", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.have.property('laboratories');
    pm.expect(jsonData.data).to.have.property('pagination');
});

pm.test("Pagination validation", function () {
    const jsonData = pm.response.json();
    const pagination = jsonData.data.pagination;
    pm.expect(pagination).to.have.property('currentPage');
    pm.expect(pagination).to.have.property('totalPages');
    pm.expect(pagination).to.have.property('totalLaboratories');
    pm.expect(pagination).to.have.property('hasNext');
    pm.expect(pagination).to.have.property('hasPrev');
    console.log("📄 Page", pagination.currentPage, "of", pagination.totalPages);
});

pm.test("Laboratory data fields validation", function () {
    const jsonData = pm.response.json();
    const laboratories = jsonData.data.laboratories;
    
    if (laboratories.length > 0) {
        laboratories.forEach((lab, index) => {
            pm.expect(lab).to.have.property('name');
            pm.expect(lab).to.have.property('licenseNumber');
            pm.expect(lab).to.have.property('status');
            pm.expect(lab).to.have.property('address');
            pm.expect(lab).to.have.property('contact');
        });
        console.log("🏥 Found", laboratories.length, "laboratories");
    }
});

pm.test("Status filter working", function () {
    const jsonData = pm.response.json();
    const laboratories = jsonData.data.laboratories;
    const urlParams = new URLSearchParams(pm.request.url.split('?')[1]);
    const statusFilter = urlParams.get('status');
    
    if (statusFilter && laboratories.length > 0) {
        laboratories.forEach(lab => {
            pm.expect(lab.status).to.equal(statusFilter);
        });
        console.log("✅ All laboratories have status:", statusFilter);
    }
});
```

#### **Get Laboratory Details**
```http
GET {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Laboratory details retrieved successfully", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Complete laboratory data validation", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData).to.have.property('data');
    
    const lab = jsonData.data;
    pm.expect(lab).to.have.property('name');
    pm.expect(lab).to.have.property('licenseNumber');
    pm.expect(lab).to.have.property('laboratoryId');
    pm.expect(lab).to.have.property('address');
    pm.expect(lab).to.have.property('contact');
    pm.expect(lab).to.have.property('workingHours');
    pm.expect(lab).to.have.property('status');
});

pm.test("Contact information validation", function () {
    const jsonData = pm.response.json();
    const contact = jsonData.data.contact;
    
    pm.expect(contact).to.have.property('phone');
    pm.expect(contact).to.have.property('email');
    pm.expect(contact.phone).to.be.a('string');
    pm.expect(contact.email).to.be.a('string');
    
    // Validate phone format (Moroccan)
    pm.expect(contact.phone).to.match(/^0[5-7]\d{8}$/);
    
    // Validate email format
    pm.expect(contact.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});

pm.test("Working hours structure validation", function () {
    const jsonData = pm.response.json();
    const workingHours = jsonData.data.workingHours;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        pm.expect(workingHours).to.have.property(day);
        const daySchedule = workingHours[day];
        pm.expect(daySchedule).to.have.property('open');
        pm.expect(daySchedule).to.have.property('close');
        pm.expect(daySchedule).to.have.property('isClosed');
        
        if (!daySchedule.isClosed) {
            pm.expect(daySchedule.open).to.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
            pm.expect(daySchedule.close).to.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
        }
    });
});

pm.test("Available tests validation", function () {
    const jsonData = pm.response.json();
    const tests = jsonData.data.availableTests;
    
    if (tests && tests.length > 0) {
        tests.forEach(test => {
            pm.expect(test).to.have.property('testCode');
            pm.expect(test).to.have.property('testName');
            pm.expect(test).to.have.property('category');
            pm.expect(test).to.have.property('turnaroundTime');
            pm.expect(test).to.have.property('price');
            
            pm.expect(test.turnaroundTime).to.be.a('number');
            pm.expect(test.price).to.be.a('number');
        });
        console.log("🧪 Laboratory offers", tests.length, "different tests");
    }
});

pm.test("Services and specializations validation", function () {
    const jsonData = pm.response.json();
    const lab = jsonData.data;
    
    if (lab.services) {
        pm.expect(lab.services).to.be.an('array');
        console.log("🔬 Services:", lab.services.length);
    }
    
    if (lab.specializations) {
        pm.expect(lab.specializations).to.be.an('array');
        console.log("🎯 Specializations:", lab.specializations.length);
    }
});
```

#### **Update Laboratory Info**
```http
PUT {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "0522123457",
  "email": "updated@advanced-diagnostics.ma",
  "services": [
    "Blood Tests",
    "Urine Analysis",
    "X-Ray",
    "CT Scan",
    "MRI",
    "Ultrasound",
    "ECG",
    "Pathology",
    "Genetic Testing",
    "Molecular Diagnostics"
  ],
  "specializations": [
    "Clinical Chemistry",
    "Hematology",
    "Microbiology",
    "Immunology",
    "Molecular Biology"
  ]
}
```

**Test Script:**
```javascript
pm.test("Laboratory update successful", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Updated data validation", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData).to.have.property('data');
    
    const lab = jsonData.data;
    pm.expect(lab.contact.phone).to.equal("0522123457");
    pm.expect(lab.contact.email).to.equal("updated@advanced-diagnostics.ma");
});

pm.test("Services array updated correctly", function () {
    const jsonData = pm.response.json();
    const services = jsonData.data.services;
    
    pm.expect(services).to.be.an('array');
    pm.expect(services.length).to.equal(10);
    pm.expect(services).to.include("Molecular Diagnostics");
    pm.expect(services).to.include("Genetic Testing");
    console.log("🔄 Laboratory now offers", services.length, "services");
});

pm.test("Specializations updated correctly", function () {
    const jsonData = pm.response.json();
    const specializations = jsonData.data.specializations;
    
    if (specializations) {
        pm.expect(specializations).to.be.an('array');
        pm.expect(specializations.length).to.equal(5);
        pm.expect(specializations).to.include("Molecular Biology");
        console.log("🎯 Laboratory has", specializations.length, "specializations");
    }
});

pm.test("Timestamps updated", function () {
    const jsonData = pm.response.json();
    const lab = jsonData.data;
    
    pm.expect(lab).to.have.property('updatedAt');
    const updatedAt = new Date(lab.updatedAt);
    const now = new Date();
    const timeDiff = now - updatedAt;
    
    // Should be updated within last 5 seconds
    pm.expect(timeDiff).to.be.below(5000);
});
```

#### **Activate Laboratory**
```http
PATCH {{base_url}}/api/v1/laboratories/{{laboratory_id}}/activate
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Laboratory activation successful", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Status changed to active", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData.data.status).to.equal('active');
    console.log("✅ Laboratory activated successfully");
});

pm.test("Activation metadata recorded", function () {
    const jsonData = pm.response.json();
    const lab = jsonData.data;
    
    pm.expect(lab).to.have.property('updatedAt');
    if (lab.lastActivatedAt) {
        pm.expect(lab.lastActivatedAt).to.be.a('string');
        pm.expect(new Date(lab.lastActivatedAt)).to.be.instanceOf(Date);
    }
});

pm.test("Laboratory available for operations", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.equal('active');
    console.log("🟢 Laboratory is now available for lab orders");
});
```

#### **Suspend Laboratory**
```http
PATCH {{base_url}}/api/v1/laboratories/{{laboratory_id}}/suspend
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Quality control audit pending - equipment calibration required",
  "suspensionDuration": "15 days",
  "notifyStaff": true,
  "allowEmergency": false
}
```

**Test Script:**
```javascript
pm.test("Laboratory suspension successful", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Status changed to suspended", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData.data.status).to.equal('suspended');
    console.log("⏸️ Laboratory suspended successfully");
});

pm.test("Suspension details recorded", function () {
    const jsonData = pm.response.json();
    const lab = jsonData.data;
    
    pm.expect(lab).to.have.property('suspensionReason');
    pm.expect(lab).to.have.property('suspendedAt');
    pm.expect(lab.suspensionReason).to.include("Quality control audit");
    
    const suspendedAt = new Date(lab.suspendedAt);
    const now = new Date();
    const timeDiff = now - suspendedAt;
    
    // Should be suspended within last 5 seconds
    pm.expect(timeDiff).to.be.below(5000);
});

pm.test("Suspension metadata validation", function () {
    const jsonData = pm.response.json();
    const suspension = jsonData.data.suspensionDetails;
    
    if (suspension) {
        pm.expect(suspension).to.have.property('duration');
        pm.expect(suspension).to.have.property('notifyStaff');
        pm.expect(suspension.duration).to.equal("15 days");
        pm.expect(suspension.notifyStaff).to.be.true;
    }
});

pm.test("Laboratory unavailable for new orders", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.equal('suspended');
    console.log("🔴 Laboratory is now suspended - no new lab orders allowed");
});
```

#### **Delete Laboratory**
```http
DELETE {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
```

---

### 📂 System Overview

#### **View All Patients**
```http
GET {{base_url}}/api/v1/patients?page=1&limit=10&status=active
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `search` (optional): Search by name or ID
- `bloodType` (optional): Filter by blood type
- `age` (optional): Filter by age range

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
- `date` (optional): Filter by date (YYYY-MM-DD)
- `department` (optional): Filter by department

#### **View All Consultations** ✨ NEW
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
- `date` (optional): Filter by date range

#### **View All Prescriptions** ✨ NEW
```http
GET {{base_url}}/api/v1/prescriptions?page=1&limit=10&status=signed
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (draft/signed/dispensed/cancelled)
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `pharmacyId` (optional): Filter by pharmacy

#### **View All Lab Orders** ✨ NEW
```http
GET {{base_url}}/api/v1/lab-orders?page=1&limit=10&status=pending
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending/in_progress/completed/cancelled)
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `laboratoryId` (optional): Filter by laboratory

#### **System Statistics**
```http
GET {{base_url}}/api/v1/admin/statistics
Authorization: Bearer {{access_token}}
```

**Response includes:**
- Total users by role
- Active appointments today
- Completed consultations this month
- Pending prescriptions
- Lab orders status
- System health metrics

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

### Pagination Test
```javascript
pm.test("Pagination structure is correct", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.pagination) {
        pm.expect(jsonData.data.pagination).to.have.property('page');
        pm.expect(jsonData.data.pagination).to.have.property('limit');
        pm.expect(jsonData.data.pagination).to.have.property('total');
        pm.expect(jsonData.data.pagination).to.have.property('pages');
    }
});
```

### Error Handling Test
```javascript
pm.test("Error response has proper structure", function () {
    if (pm.response.code >= 400) {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('success');
        pm.expect(jsonData.success).to.be.false;
        pm.expect(jsonData).to.have.property('error');
    }
});
```

---

## 🔧 Environment Variables

Make sure these variables are set in your Postman environment:

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

## 📝 Notes

1. **Authentication**: All admin endpoints require a valid JWT token in the Authorization header
2. **Permissions**: Admin role has full access to all system operations
3. **Rate Limiting**: Some endpoints may have rate limiting applied
4. **Validation**: All create/update endpoints have request validation
5. **Audit Trail**: All admin operations are logged for audit purposes

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Admin Operations