# HealthPulse API - Admin Laboratory Management Postman Guide

## 📋 Laboratory Management Overview

This comprehensive guide provides detailed instructions for testing all admin laboratory management operations using Postman. Admins have full control over laboratory partners in the HealthPulse system.

---

## 🔐 Prerequisites

### Environment Setup
```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "admin_id": "",
  "laboratory_id": "",
  "lab_technician_id": ""
}
```

### Admin Authentication
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

**Post-response Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("admin_id", response.data.user.id);
    console.log("✅ Admin authenticated successfully");
}
```

---

## 📁 Laboratory Management Operations

### 🏗️ 1. Register Partner Laboratory

#### **Create New Laboratory**
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
  "address": "456 Science Boulevard, Medical District, Casablanca 20250",
  "phone": "0522123456",
  "email": "info@advanced-diagnostics.ma",
  "emergencyPhone": "0522987654",
  "accreditation": "CAP",
  "certifications": ["ISO 15189", "CAP", "CLIA"],
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
  "availableTests": [
    {
      "testCode": "CBC",
      "testName": "Complete Blood Count",
      "category": "hematology",
      "specimen": "blood",
      "turnaroundTime": 24,
      "price": 150,
      "preparationInstructions": "Fasting not required"
    },
    {
      "testCode": "BMP",
      "testName": "Basic Metabolic Panel",
      "category": "biochemistry",
      "specimen": "blood",
      "turnaroundTime": 12,
      "price": 200,
      "preparationInstructions": "12-hour fasting required"
    },
    {
      "testCode": "TSH",
      "testName": "Thyroid Stimulating Hormone",
      "category": "immunology",
      "specimen": "blood",
      "turnaroundTime": 24,
      "price": 120,
      "preparationInstructions": "Morning collection preferred"
    }
  ],
  "services": [
    "Blood Tests",
    "Urine Analysis",
    "X-Ray",
    "CT Scan",
    "MRI",
    "Ultrasound",
    "ECG",
    "Pathology",
    "Microbiology",
    "Genetic Testing"
  ],
  "specializations": [
    "Clinical Chemistry",
    "Hematology",
    "Microbiology",
    "Immunology",
    "Molecular Biology"
  ],
  "equipment": [
    {
      "name": "Automated Blood Analyzer",
      "manufacturer": "Siemens",
      "model": "ADVIA 120",
      "status": "operational"
    },
    {
      "name": "CT Scanner",
      "manufacturer": "GE Healthcare",
      "model": "Revolution CT",
      "status": "operational"
    }
  ],
  "coordinates": {
    "latitude": 33.5731,
    "longitude": -7.5898
  },
  "turnaroundTime": {
    "routine": "24 hours",
    "urgent": "2 hours",
    "stat": "30 minutes"
  }
}
```

**Post-response Test Script:**
```javascript
pm.test("Laboratory registration successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Laboratory data returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.have.property('name');
    pm.expect(jsonData.data).to.have.property('licenseNumber');
    pm.expect(jsonData.data).to.have.property('laboratoryId');
});

pm.test("Laboratory ID saved to environment", function () {
    if (pm.response.code === 201) {
        const response = pm.response.json();
        pm.environment.set("laboratory_id", response.data._id);
        console.log("🏥 Laboratory ID saved:", response.data._id);
    }
});

pm.test("Required fields validation", function () {
    const jsonData = pm.response.json();
    if (jsonData.success) {
        pm.expect(jsonData.data.name).to.equal("Advanced Diagnostics Lab");
        pm.expect(jsonData.data.licenseNumber).to.equal("LAB-2024-001");
        pm.expect(jsonData.data.status).to.equal("active");
    }
});
```

---

### 📋 2. List All Laboratories

#### **Get All Laboratories with Filtering**
```http
GET {{base_url}}/api/v1/laboratories?status=active&page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `status` (optional): Filter by status (active/inactive/suspended)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or license number
- `accreditation` (optional): Filter by accreditation type

**Post-response Test Script:**
```javascript
pm.test("Laboratories list retrieved", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Response structure validation", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.have.property('laboratories');
    pm.expect(jsonData.data).to.have.property('pagination');
});

pm.test("Pagination info present", function () {
    const jsonData = pm.response.json();
    const pagination = jsonData.data.pagination;
    pm.expect(pagination).to.have.property('currentPage');
    pm.expect(pagination).to.have.property('totalPages');
    pm.expect(pagination).to.have.property('totalLaboratories');
    pm.expect(pagination).to.have.property('hasNext');
    pm.expect(pagination).to.have.property('hasPrev');
});

pm.test("Laboratory data fields validation", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.laboratories.length > 0) {
        const lab = jsonData.data.laboratories[0];
        pm.expect(lab).to.have.property('name');
        pm.expect(lab).to.have.property('licenseNumber');
        pm.expect(lab).to.have.property('status');
        pm.expect(lab).to.have.property('address');
        console.log("📊 Found", jsonData.data.laboratories.length, "laboratories");
    }
});
```

#### **Search Laboratories**
```http
GET {{base_url}}/api/v1/laboratories?search=Advanced&accreditation=CAP
Authorization: Bearer {{access_token}}
```

---

### 🔍 3. Get Laboratory Details

#### **Retrieve Specific Laboratory**
```http
GET {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
```

**Post-response Test Script:**
```javascript
pm.test("Laboratory details retrieved", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Complete laboratory data validation", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData).to.have.property('data');
    
    const lab = jsonData.data;
    pm.expect(lab).to.have.property('name');
    pm.expect(lab).to.have.property('licenseNumber');
    pm.expect(lab).to.have.property('address');
    pm.expect(lab).to.have.property('contact');
    pm.expect(lab).to.have.property('workingHours');
    pm.expect(lab).to.have.property('availableTests');
    pm.expect(lab).to.have.property('services');
});

pm.test("Working hours structure", function () {
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
        });
        console.log("🧪 Laboratory offers", tests.length, "different tests");
    }
});
```

---

### ✏️ 4. Update Laboratory Information

#### **Update Laboratory Details**
```http
PUT {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "0522123457",
  "email": "contact@advanced-diagnostics.ma",
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
    "Molecular Diagnostics",
    "Cardiac Catheterization"
  ],
  "specializations": [
    "Clinical Chemistry",
    "Hematology",
    "Microbiology",
    "Immunology",
    "Molecular Biology",
    "Cytogenetics"
  ],
  "turnaroundTime": {
    "routine": "24 hours",
    "urgent": "1 hour",
    "stat": "15 minutes"
  }
}
```

**Post-response Test Script:**
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
    pm.expect(lab.contact.email).to.equal("contact@advanced-diagnostics.ma");
    pm.expect(lab.services).to.include("Molecular Diagnostics");
    pm.expect(lab.turnaroundTime.urgent).to.equal("1 hour");
});

pm.test("Services array updated", function () {
    const jsonData = pm.response.json();
    const services = jsonData.data.services;
    pm.expect(services).to.be.an('array');
    pm.expect(services.length).to.be.at.least(10);
    pm.expect(services).to.include("Cardiac Catheterization");
    console.log("🔄 Laboratory now offers", services.length, "services");
});
```

---

### ✅ 5. Activate Laboratory

#### **Activate Suspended Laboratory**
```http
PATCH {{base_url}}/api/v1/laboratories/{{laboratory_id}}/activate
Authorization: Bearer {{access_token}}
```

**Post-response Test Script:**
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

pm.test("Activation timestamp recorded", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.lastActivatedAt) {
        pm.expect(jsonData.data.lastActivatedAt).to.be.a('string');
        pm.expect(new Date(jsonData.data.lastActivatedAt)).to.be.instanceOf(Date);
    }
});
```

---

### ⏸️ 6. Suspend Laboratory

#### **Suspend Laboratory Operations**
```http
PATCH {{base_url}}/api/v1/laboratories/{{laboratory_id}}/suspend
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Quality control audit pending - laboratory equipment calibration required",
  "suspensionDuration": "15 days",
  "notifyStaff": true,
  "allowEmergency": false
}
```

**Post-response Test Script:**
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
});

pm.test("Suspension metadata validation", function () {
    const jsonData = pm.response.json();
    const suspension = jsonData.data.suspensionDetails;
    if (suspension) {
        pm.expect(suspension).to.have.property('duration');
        pm.expect(suspension).to.have.property('notifyStaff');
        pm.expect(suspension.notifyStaff).to.be.true;
    }
});
```

---

### 🗑️ 7. Delete Laboratory

#### **Remove Laboratory from System**
```http
DELETE {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
```

**Pre-request Script:**
```javascript
// Confirm deletion action
console.log("⚠️ WARNING: This will permanently delete the laboratory");
console.log("Laboratory ID:", pm.environment.get("laboratory_id"));
```

**Post-response Test Script:**
```javascript
pm.test("Laboratory deletion successful", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Deletion confirmation", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success', true);
    pm.expect(jsonData.message).to.include("deleted successfully");
    console.log("🗑️ Laboratory deleted permanently");
});

pm.test("Laboratory no longer accessible", function () {
    // This test checks that the deletion was successful
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    
    // Clear the laboratory_id from environment since it's deleted
    pm.environment.unset("laboratory_id");
    console.log("🧹 Laboratory ID cleared from environment");
});
```

---

## 🧪 Advanced Testing Scenarios

### **End-to-End Laboratory Workflow Test**

**Collection Runner Script:**
```javascript
// Pre-request script for the entire collection
pm.globals.set("test_start_time", new Date().toISOString());
console.log("🚀 Starting Laboratory Management E2E Test");

// Collection variables
pm.globals.set("created_labs", JSON.stringify([]));
pm.globals.set("test_results", JSON.stringify({
    created: 0,
    updated: 0,
    activated: 0,
    suspended: 0,
    deleted: 0,
    failed: 0
}));
```

### **Bulk Operations Test**

#### **Create Multiple Laboratories**
```javascript
// Pre-request script for bulk creation
const labData = [
    {
        name: "Central Medical Lab",
        licenseNumber: "LAB-2024-002",
        address: "789 Health Street, Rabat"
    },
    {
        name: "Express Diagnostics",
        licenseNumber: "LAB-2024-003", 
        address: "321 Quick Ave, Marrakech"
    },
    {
        name: "Premium Lab Services",
        licenseNumber: "LAB-2024-004",
        address: "654 Elite Boulevard, Fes"
    }
];

pm.globals.set("bulk_lab_data", JSON.stringify(labData));
pm.globals.set("current_lab_index", "0");
```

---

## 🔧 Environment Variables Reference

### **Required Variables**
```json
{
  "base_url": "http://localhost:3000",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin_id": "673abc123def456789012345",
  "laboratory_id": "673lab123def456789012345",
  "lab_technician_id": "673tech123def456789012345"
}
```

### **Optional Test Variables**
```json
{
  "test_lab_name": "Test Laboratory {{$randomCompanyName}}",
  "test_license_number": "LAB-TEST-{{$randomInt}}",
  "test_email": "test{{$randomInt}}@testlab.com",
  "test_phone": "05221234{{$randomInt}}"
}
```

---

## 📊 Test Reports and Monitoring

### **Custom Test Reporting**
```javascript
// Post-request script for collection summary
pm.test("Laboratory Management Test Summary", function () {
    const results = JSON.parse(pm.globals.get("test_results"));
    
    console.log("📈 Laboratory Management Test Results:");
    console.log("✅ Created:", results.created);
    console.log("🔄 Updated:", results.updated);
    console.log("✅ Activated:", results.activated);
    console.log("⏸️ Suspended:", results.suspended);
    console.log("🗑️ Deleted:", results.deleted);
    console.log("❌ Failed:", results.failed);
    
    const total = results.created + results.updated + results.activated + 
                  results.suspended + results.deleted;
    const successRate = ((total - results.failed) / total * 100).toFixed(2);
    
    console.log("📊 Success Rate:", successRate + "%");
    
    pm.expect(results.failed).to.equal(0);
});
```

---

## 🚨 Error Handling and Troubleshooting

### **Common Error Scenarios**

#### **Authentication Errors**
```javascript
pm.test("Handle authentication errors", function () {
    if (pm.response.code === 401) {
        console.log("🔐 Authentication failed - token may be expired");
        console.log("💡 Run the admin login request to refresh token");
    }
});
```

#### **Validation Errors**
```javascript
pm.test("Handle validation errors", function () {
    if (pm.response.code === 400) {
        const jsonData = pm.response.json();
        if (jsonData.errors) {
            jsonData.errors.forEach(error => {
                console.log("❌ Validation Error:", error.field, "-", error.message);
            });
        }
    }
});
```

#### **Resource Not Found**
```javascript
pm.test("Handle not found errors", function () {
    if (pm.response.code === 404) {
        console.log("🔍 Laboratory not found");
        console.log("💡 Check if laboratory_id is correct in environment");
    }
});
```

---

## 📝 Test Checklist

### **Pre-Testing Checklist**
- [ ] Admin authentication token is valid
- [ ] Base URL is correctly configured
- [ ] Environment variables are set
- [ ] Database is accessible
- [ ] Laboratory permissions are properly configured

### **Post-Testing Checklist**
- [ ] All created test laboratories are cleaned up
- [ ] Environment variables are reset
- [ ] Test results are documented
- [ ] Any failed tests are investigated
- [ ] Performance metrics are recorded

---

**Last Updated:** November 3, 2025  
**API Version:** 1.0  
**Guide Type:** Laboratory Management Testing  
**Admin Role:** Full Laboratory Control