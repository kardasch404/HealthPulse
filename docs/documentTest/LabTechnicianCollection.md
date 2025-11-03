# HealthPulse API - Lab Technician Operations Collection

## 📋 Lab Technician Collection Overview

This document provides detailed API documentation for all lab technician operations in the HealthPulse system. Lab technicians can manage lab orders, process tests, record results, and handle their laboratory operations.

---

## 🔐 Authentication

### Lab Technician Login
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "labtech@healthpulse.com",
  "password": "LabTech@123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("refresh_token", response.data.tokens.refreshToken);
    pm.environment.set("lab_technician_id", response.data.user.id);
    pm.environment.set("laboratory_id", response.data.user.laboratoryId);
}
```

---

## 📁 8. Lab Technician Operations ✨ NEW

### 📂 My Laboratory

---

#### **1️⃣ View My Laboratory Information**
```http
GET {{base_url}}/api/v1/laboratories/{{laboratory_id}}
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/laboratories/{{laboratory_id}}`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Laboratory information retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('name');
    pm.expect(jsonData.data).to.have.property('licenseNumber');
    pm.expect(jsonData.data).to.have.property('accreditation');
    pm.expect(jsonData.data).to.have.property('services');
});

pm.test("Laboratory has test catalog", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.testCatalog) {
        pm.expect(jsonData.data.testCatalog).to.be.an('array');
    }
});

// Display laboratory info
const lab = pm.response.json().data;
console.log("Laboratory Name:", lab.name);
console.log("License:", lab.licenseNumber);
console.log("Accreditation:", lab.accreditation?.join(", ") || "None");
console.log("Status:", lab.status);
console.log("Tests Available:", lab.testCatalog?.length || 0);
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Laboratory retrieved successfully",
  "data": {
    "_id": "6907...",
    "name": "Central Clinical Laboratory",
    "licenseNumber": "LAB-2024-001",
    "address": "456 Medical Center",
    "phone": "555-0200",
    "email": "lab@centralclinic.com",
    "accreditation": ["CAP", "CLIA", "ISO 15189"],
    "services": [
      "Clinical Chemistry",
      "Hematology",
      "Microbiology",
      "Immunology"
    ],
    "testCatalog": [...],
    "workingHours": {
      "monday": {"start": "06:00", "end": "22:00"}
    },
    "status": "active",
    "verified": true
  }
}
```

---

### 📂 Sample Management (Advanced)

---

#### **Log Sample Receipt**
```http
POST {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/samples/log
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**✅ Ready to Test in Postman:**
1. Method: `POST`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/samples/log`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):

**Request Body:**
```json
{
  "sampleType": "Blood",
  "collectionTime": "2025-11-03T08:30:00.000Z",
  "receivedTime": "2025-11-03T09:15:00.000Z",
  "volume": "10 mL",
  "container": "Purple top EDTA tube",
  "sampleQuality": "Good",
  "condition": "No hemolysis, no clotting",
  "storageLocation": "Refrigerator A, Shelf 3",
  "notes": "Sample received in good condition, properly labeled"
}
```

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Sample logged successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

console.log("✅ Sample logged successfully");
```

---

#### **Update Sample Status**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/samples/{{sample_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**✅ Ready to Test in Postman:**
1. Method: `PATCH`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/samples/{{sample_id}}/status`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):

**Request Body (Processing):**
```json
{
  "status": "processing",
  "notes": "Sample prepared for testing"
}
```

**Request Body (Tested):**
```json
{
  "status": "tested",
  "notes": "All tests completed"
}
```

**Request Body (Rejected):**
```json
{
  "status": "rejected",
  "rejectionReason": "Hemolyzed sample - requires recollection",
  "notes": "Sample quality compromised"
}
```

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Sample status updated", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

console.log("✅ Sample status updated");
```

---

#### **3️⃣ Get Lab Order Details**
```http
GET {{base_url}}/api/v1/lab-orders/{{lab_order_id}}
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Lab order details retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('orderNumber');
    pm.expect(jsonData.data).to.have.property('tests');
    pm.expect(jsonData.data).to.have.property('status');
    pm.expect(jsonData.data).to.have.property('clinicalIndication');
});

pm.test("Tests array exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.tests).to.be.an('array');
    pm.expect(jsonData.data.tests.length).to.be.at.least(1);
});

pm.test("Laboratory info included", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('laboratoryId');
});

// Display order details
const order = pm.response.json().data;
console.log("\n🧪 Lab Order Details");
console.log("====================");
console.log("Order Number:", order.orderNumber);
console.log("Status:", order.status);
console.log("Urgency:", order.urgency);
console.log("Patient:", order.patientId?.fname, order.patientId?.lname);
console.log("Doctor:", order.doctorId?.fname, order.doctorId?.lname);
console.log("Clinical Indication:", order.clinicalIndication);
console.log("Fasting Required:", order.fastingRequired ? "Yes" : "No");

console.log("\n📊 Tests Ordered:");
order.tests?.forEach((test, i) => {
    console.log(`${i+1}. ${test.name} (${test.code})`);
    console.log(`   Category: ${test.category}`);
    console.log(`   Status: ${test.status}`);
    console.log(`   Urgency: ${test.urgency}`);
    if (test.instructions) {
        console.log(`   Instructions: ${test.instructions}`);
    }
});
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lab order retrieved successfully",
  "data": {
    "_id": "6907...",
    "orderNumber": "LAB-2025-123456",
    "consultationId": {
      "_id": "6907...",
      "chiefComplaint": "Fatigue"
    },
    "patientId": {
      "_id": "6907...",
      "fname": "John",
      "lname": "Doe",
      "dateOfBirth": "1990-01-15"
    },
    "doctorId": {
      "_id": "6907...",
      "fname": "Dr. Smith",
      "specialization": "Internal Medicine"
    },
    "laboratoryId": {
      "_id": "6907...",
      "name": "Central Lab"
    },
    "tests": [
      {
        "_id": "6907...",
        "name": "Complete Blood Count",
        "code": "CBC",
        "category": "Hematology",
        "status": "pending",
        "urgency": "routine",
        "instructions": "Fasting not required"
      }
    ],
    "status": "pending",
    "urgency": "routine",
    "clinicalIndication": "Check for anemia",
    "fastingRequired": false,
    "createdAt": "2025-11-03T..."
  }
}
```

---

#### **4️⃣ Update Lab Order Status**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**✅ Ready to Test in Postman:**
1. Method: `PATCH`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):

**Request Body (Mark as Sample Collected):**
```json
{
  "status": "sample_collected",
  "reason": "Sample received and logged"
}
```

**Request Body (Mark as In Progress):**
```json
{
  "status": "in_progress",
  "reason": "Testing procedures initiated"
}
```

**Request Body (Mark as Completed):**
```json
{
  "status": "completed",
  "reason": "All tests completed and validated"
}
```

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Status updated successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('status');
});

console.log("✅ Order status updated to:", pm.response.json().data.status);
```

---

#### **5️⃣ Update Test Status**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/tests/{{test_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**✅ Ready to Test in Postman:**
1. Method: `PATCH`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/tests/{{test_id}}/status`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):

**Request Body:**
```json
{
  "status": "completed",
  "results": {
    "WBC": "7.5 x10^9/L",
    "RBC": "5.2 x10^12/L",
    "Hemoglobin": "15.0 g/dL",
    "Hematocrit": "45.0%",
    "Platelets": "250 x10^9/L"
  },
  "interpretation": "All values within normal range",
  "resultNotes": "No abnormalities detected"
}
```

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Test status updated", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

console.log("✅ Test status updated successfully");
```

---

#### **6️⃣ Add Test Results**
```http
POST {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/tests/{{test_id}}/results
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**✅ Ready to Test in Postman:**
1. Method: `POST`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/tests/{{test_id}}/results`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):

**Request Body:**
```json
{
  "results": {
    "WBC": "7.5 x10^9/L",
    "RBC": "5.2 x10^12/L",
    "Hemoglobin": "15.0 g/dL",
    "Hematocrit": "45.0%",
    "Platelets": "250 x10^9/L",
    "MCV": "88.0 fL",
    "MCH": "29.0 pg",
    "MCHC": "33.0 g/dL"
  },
  "interpretation": "Complete Blood Count shows all values within normal reference ranges. No evidence of anemia, infection, or bleeding disorders.",
  "notes": "Quality control passed. Results validated.",
  "criticalValues": []
}
```

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Results added successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("result");
});

console.log("✅ Test results added successfully");
```

---

#### **7️⃣ Get Lab Results**
```http
GET {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Lab results retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('orderNumber');
    pm.expect(jsonData.data).to.have.property('completedTests');
});

// Display results
const data = pm.response.json().data;
console.log("\n📊 Lab Results");
console.log("==============");
console.log("Order Number:", data.orderNumber);
console.log("Status:", data.status);
console.log("Completed Tests:", data.completedTests?.length || 0);
console.log("Pending Tests:", data.pendingTests?.length || 0);

if (data.completedTests) {
    console.log("\n✅ Completed Tests:");
    data.completedTests.forEach((test, i) => {
        console.log(`${i+1}. ${test.name} (${test.code})`);
        console.log(`   Status: ${test.status}`);
        if (test.results) {
            console.log("   Results:", JSON.stringify(test.results, null, 2));
        }
        if (test.interpretation) {
            console.log(`   Interpretation: ${test.interpretation}`);
        }
    });
}
```

---

#### **8️⃣ Get Order Statistics**
```http
GET {{base_url}}/api/v1/lab-orders/statistics/overview
Authorization: Bearer {{access_token}}
```

**✅ Ready to Test in Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/api/v1/lab-orders/statistics/overview`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
4. Click **Send**

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Statistics retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('object');
});

// Display stats
const stats = pm.response.json().data;
console.log("\n📈 Lab Order Statistics");
console.log("======================");
console.log("Total Orders:", stats.totalOrders || 0);
console.log("Pending:", stats.pendingOrders || 0);
console.log("In Progress:", stats.inProgressOrders || 0);
console.log("Completed:", stats.completedOrders || 0);
```

---

### 📂 My Profile

---

#### **9️⃣ View My Profile**
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

pm.test("Lab technician profile retrieved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('email');
    pm.expect(jsonData.data).to.have.property('fname');
    pm.expect(jsonData.data).to.have.property('lname');
    pm.expect(jsonData.data.role).to.equal('lab_technician');
});

const user = pm.response.json().data;
console.log("Name:", user.fname, user.lname);
console.log("Email:", user.email);
console.log("Role:", user.role);
```

---

#### **🔟 Update My Profile**
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
  "licenseNumber": "LAB-2024-002",
  "specialization": "Clinical Chemistry and Hematology",
  "certifications": ["MLT", "ASCP"],
  "experience": 6,
  "shift": "Day Shift"
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
});

console.log("✅ Profile updated successfully");
```

---

### 🎯 **Quick Test Checklist for Lab Technician Operations**

**Prerequisites:**
- ✅ Login as lab technician and save `access_token`, `lab_technician_id`, and `laboratory_id`
- ✅ Have lab orders assigned to your laboratory

**Test Sequence:**

1. **GET My Laboratory Info** ✅
   - URL: `{{base_url}}/api/v1/laboratories/{{laboratory_id}}`
   - Should show laboratory details

2. **GET All Lab Orders** ✅
   - URL: `{{base_url}}/api/v1/lab-orders`
   - Should return orders for your lab
   - Save `lab_order_id` from response

3. **GET Lab Order Details** ✅
   - URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}`
   - Should show full test list

4. **PATCH Update Order Status** ✅
   - URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status`
   - Change status to `sample_collected` → `in_progress` → `completed`

5. **PATCH Update Test Status** ✅
   - URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/tests/{{test_id}}/status`
   - Update individual test status

6. **POST Add Test Results** ✅
   - URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/tests/{{test_id}}/results`
   - Add test results with interpretation

7. **GET Lab Results** ✅
   - URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results`
   - View all completed results

8. **GET Statistics** ✅
   - URL: `{{base_url}}/api/v1/lab-orders/statistics/overview`
   - View order statistics

9. **GET My Profile** ✅
   - URL: `{{base_url}}/api/v1/users/me`
   - View your profile

10. **PUT Update Profile** ✅
    - URL: `{{base_url}}/api/v1/users/me`
    - Update profile information

---

### 🔍 **Common Issues & Solutions**

**Issue 1: "Lab technician not authorized"**
- **Solution**: Make sure you're logged in with lab technician credentials
- **Solution**: Check that `access_token` is valid

**Issue 2: "Laboratory not found"**
- **Solution**: Verify `laboratory_id` is set in environment
- **Solution**: Check lab technician is associated with a laboratory

**Issue 3: "Cannot update order status"**
- **Solution**: Check current status allows the transition
- **Solution**: Ensure you have PROCESS_LAB_ORDERS permission

**Issue 4: "Test not found"**
- **Solution**: Get `test_id` from lab order details first
- **Solution**: Verify test belongs to the order

**Issue 5: Empty lab orders list**
- **Solution**: Ask a doctor to create lab orders for your laboratory
- **Solution**: Check status filters

---

### 📊 **Sample Test Flow in Postman**

```javascript
// 1. Login as Lab Technician (POST /api/v1/auth/login)
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.data.tokens.accessToken);
    pm.environment.set("lab_technician_id", response.data.user.id);
    console.log("✅ Lab Technician logged in");
}

// 2. Get All Lab Orders (GET /api/v1/lab-orders)
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data.labOrders && response.data.labOrders.length > 0) {
        const order = response.data.labOrders[0];
        pm.environment.set("lab_order_id", order._id);
        
        // Save first test ID for test status updates
        if (order.tests && order.tests.length > 0) {
            pm.environment.set("test_id", order.tests[0]._id);
        }
        
        console.log("✅ Lab Order ID saved:", order._id);
        console.log("   Status:", order.status);
        console.log("   Tests:", order.tests.length);
    }
}

// 3. Update Order Status (PATCH /api/v1/lab-orders/{{lab_order_id}}/status)
console.log("✅ Order status updated");

// 4. Add Test Results (POST /api/v1/lab-orders/{{lab_order_id}}/tests/{{test_id}}/results)
console.log("✅ Test results added");

// 5. Get Results (GET /api/v1/lab-orders/{{lab_order_id}}/results)
if (pm.response.code === 200) {
    const response = pm.response.json();
    console.log("✅ Results:", response.data.completedTests?.length || 0, "tests completed");
}
```

---

### 🧪 **Lab Order Status Flow for Technicians**

| Status | Description | Technician Action |
|--------|-------------|-------------------|
| `pending` | Order received | ✅ Update to `sample_collected` |
| `sample_collected` | Sample logged in lab | ✅ Update to `in_progress` |
| `in_progress` | Tests being processed | ✅ Add results, update to `completed` |
| `partial_results` | Some tests done | ✅ Complete remaining tests |
| `completed` | All tests done | ✅ View/verify results |
| `cancelled` | Order cancelled | ❌ No action needed |
| `rejected` | Sample rejected | ✅ Document reason |

---

### 📝 **Lab Technician Responsibilities**

1. **Sample Management**
   - Receive and log samples
   - Verify sample quality
   - Track sample storage

2. **Test Processing**
   - Run ordered tests
   - Follow protocols
   - Use proper equipment

3. **Quality Control**
   - Run QC checks
   - Calibrate instruments
   - Document results

4. **Result Recording**
   - Enter test results
   - Add interpretations
   - Flag critical values

5. **Safety & Compliance**
   - Follow safety protocols
   - Maintain documentation
   - Report incidents

---

### 📂 Lab Order Management

#### **View Pending Orders**
```http
GET {{base_url}}/api/v1/lab-orders/laboratory/{{laboratory_id}}?status=pending&page=1&limit=10
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `status` (optional): Filter by status (pending/in_progress/completed/cancelled)
- `page` (optional): Page number
- `limit` (optional): Items per page
- `priority` (optional): Filter by priority (stat/urgent/routine)
- `testType` (optional): Filter by test type
- `patientName` (optional): Search by patient name
- `doctorName` (optional): Filter by ordering doctor
- `orderDate` (optional): Filter by order date

**Test Script:**
```javascript
pm.test("Pending orders for laboratory", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('orders');
    jsonData.data.orders.forEach(order => {
        pm.expect(order.laboratoryId).to.equal(pm.environment.get("laboratory_id"));
        pm.expect(order.status).to.equal('pending');
    });
});
```

#### **View All Orders**
```http
GET {{base_url}}/api/v1/lab-orders/laboratory/{{laboratory_id}}?page=1&limit=20
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- Same as pending orders, but includes all statuses

#### **Get Order Details**
```http
GET {{base_url}}/api/v1/lab-orders/{{lab_order_id}}
Authorization: Bearer {{access_token}}
```

**Test Script:**
```javascript
pm.test("Order belongs to laboratory", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.laboratoryId).to.equal(pm.environment.get("laboratory_id"));
});

pm.test("Order includes test details", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('tests');
    pm.expect(jsonData.data.tests).to.be.an('array');
    pm.expect(jsonData.data.tests[0]).to.have.property('name');
    pm.expect(jsonData.data.tests[0]).to.have.property('code');
});
```

#### **Update Order Status**

##### **Mark as In Progress**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_progress",
  "technicianId": "{{lab_technician_id}}",
  "startedAt": "2024-11-18T09:00:00Z",
  "notes": "Sample received and logged. Beginning testing procedures.",
  "estimatedCompletionTime": "2024-11-18T15:00:00Z",
  "sampleStatus": {
    "received": true,
    "quality": "good",
    "volume": "adequate",
    "labeling": "correct",
    "temperature": "appropriate"
  }
}
```

##### **Mark as Completed**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "completed",
  "technicianId": "{{lab_technician_id}}",
  "completedAt": "2024-11-18T14:30:00Z",
  "notes": "All tests completed successfully. Results reviewed and validated.",
  "qualityControl": {
    "passed": true,
    "controlsRun": ["positive_control", "negative_control"],
    "calibrationChecked": true,
    "instrumentMaintenance": "up_to_date"
  },
  "reviewedBy": "{{lab_supervisor_id}}",
  "reviewNotes": "Results within normal ranges. No critical values noted."
}
```

##### **Mark as Rejected**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "rejected",
  "technicianId": "{{lab_technician_id}}",
  "rejectedAt": "2024-11-18T09:15:00Z",
  "rejectionReason": "insufficient_sample",
  "rejectionCategory": "pre_analytical",
  "notes": "Sample volume insufficient for requested tests. Requesting new sample collection.",
  "notifyDoctor": true,
  "notifyPatient": false,
  "recommendations": "Please collect minimum 5ml blood sample in purple top tube"
}
```

**Test Script:**
```javascript
pm.test("Order status updated successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.updatedBy).to.equal(pm.environment.get("lab_technician_id"));
});
```

#### **Add Lab Results**
```http
POST {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/results
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "technicianId": "{{lab_technician_id}}",
  "resultDate": "2024-11-18T14:30:00Z",
  "results": [
    {
      "testCode": "CBC",
      "testName": "Complete Blood Count",
      "components": [
        {
          "name": "White Blood Cells",
          "value": 7.5,
          "unit": "K/uL",
          "referenceRange": "4.0-11.0",
          "flag": "normal",
          "critical": false
        },
        {
          "name": "Red Blood Cells",
          "value": 4.2,
          "unit": "M/uL",
          "referenceRange": "3.8-5.2",
          "flag": "normal",
          "critical": false
        },
        {
          "name": "Hemoglobin",
          "value": 13.8,
          "unit": "g/dL",
          "referenceRange": "12.0-16.0",
          "flag": "normal",
          "critical": false
        },
        {
          "name": "Hematocrit",
          "value": 41.2,
          "unit": "%",
          "referenceRange": "36.0-48.0",
          "flag": "normal",
          "critical": false
        }
      ]
    },
    {
      "testCode": "BMP",
      "testName": "Basic Metabolic Panel",
      "components": [
        {
          "name": "Glucose",
          "value": 95,
          "unit": "mg/dL",
          "referenceRange": "70-110",
          "flag": "normal",
          "critical": false
        },
        {
          "name": "Creatinine",
          "value": 1.1,
          "unit": "mg/dL",
          "referenceRange": "0.7-1.3",
          "flag": "normal",
          "critical": false
        }
      ]
    }
  ],
  "methodology": "Automated analyzer",
  "instrument": "Sysmex XN-1000",
  "calibrationDate": "2024-11-15",
  "qualityControlResults": {
    "level1": "passed",
    "level2": "passed",
    "level3": "passed"
  },
  "technicalNotes": "All controls within acceptable ranges. No instrument flags.",
  "criticalValues": false
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("lab_results_id", response.data.id);
    pm.test("Lab results recorded by technician", function () {
        pm.expect(response.data.technicianId).to.equal(pm.environment.get("lab_technician_id"));
    });
}
```

#### **Search Orders**
```http
GET {{base_url}}/api/v1/lab-orders/search?q={{search_term}}&laboratoryId={{laboratory_id}}
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `q` (required): Search term (patient name, order ID, test name)
- `status` (optional): Filter by status
- `fromDate` (optional): Start date for search
- `toDate` (optional): End date for search
- `limit` (optional): Number of results

#### **View Order History**
```http
GET {{base_url}}/api/v1/lab-orders/laboratory/{{laboratory_id}}/history?page=1&limit=50
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `fromDate` (optional): Start date for history
- `toDate` (optional): End date for history
- `technicianId` (optional): Filter by specific technician
- `testType` (optional): Filter by test type

---

### 📂 Sample Management (Lab Technician-specific)

#### **Log Sample Receipt**
```http
POST {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/sample-receipt
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "technicianId": "{{lab_technician_id}}",
  "receivedAt": "2024-11-18T08:30:00Z",
  "sampleDetails": {
    "type": "blood",
    "volume": "5ml",
    "container": "purple_top_tube",
    "temperature": "room_temperature",
    "condition": "good",
    "labeling": "correct"
  },
  "collectionInfo": {
    "collectedAt": "2024-11-18T07:45:00Z",
    "collectedBy": "Nurse Smith",
    "fasting": true,
    "patientCondition": "stable"
  },
  "storageLocation": "Refrigerator A-Section 3",
  "barcodeScanned": true,
  "notes": "Sample received in good condition, properly labeled"
}
```

#### **Update Sample Status**
```http
PATCH {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/sample-status
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "processed",
  "processedBy": "{{lab_technician_id}}",
  "processedAt": "2024-11-18T10:15:00Z",
  "aliquots": [
    {
      "volume": "1ml",
      "location": "Freezer B-Rack 5",
      "purpose": "chemistry_panel"
    },
    {
      "volume": "1ml", 
      "location": "Freezer B-Rack 5",
      "purpose": "hematology"
    }
  ]
}
```

---

### 📂 Quality Control (Lab Technician-specific)

#### **Record Quality Control Results**
```http
POST {{base_url}}/api/v1/laboratories/{{laboratory_id}}/quality-control
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "technicianId": "{{lab_technician_id}}",
  "testDate": "2024-11-18T09:00:00Z",
  "instrument": "Sysmex XN-1000",
  "controlType": "daily_qc",
  "controlLevels": [
    {
      "level": "normal",
      "lotNumber": "QC123456",
      "expiryDate": "2025-03-15",
      "results": [
        {
          "parameter": "WBC",
          "expected": 7.5,
          "observed": 7.6,
          "unit": "K/uL",
          "deviation": 1.3,
          "acceptable": true
        },
        {
          "parameter": "RBC",
          "expected": 4.2,
          "observed": 4.1,
          "unit": "M/uL",
          "deviation": -2.4,
          "acceptable": true
        }
      ]
    }
  ],
  "calibrationStatus": "current",
  "maintenanceStatus": "up_to_date",
  "issues": [],
  "notes": "All QC results within acceptable limits"
}
```

#### **Report Quality Issues**
```http
POST {{base_url}}/api/v1/laboratories/{{laboratory_id}}/quality-issues
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reportedBy": "{{lab_technician_id}}",
  "issueType": "instrument_malfunction",
  "severity": "medium",
  "instrument": "Chemistry Analyzer X200",
  "description": "Glucose results consistently 10% higher than expected",
  "impactedTests": ["Glucose", "HbA1c"],
  "actionTaken": "Recalibrated instrument, ran additional QC",
  "followUpRequired": true,
  "notifySupervisor": true
}
```

---

### 📂 Critical Values Management (Advanced)

---

#### **Report Critical Value**
```http
POST {{base_url}}/api/v1/lab-orders/{{lab_order_id}}/critical-value
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**✅ Ready to Test in Postman:**
1. Method: `POST`
2. URL: `{{base_url}}/api/v1/lab-orders/{{lab_order_id}}/critical-value`
3. Headers: 
   - `Authorization: Bearer {{access_token}}`
   - `Content-Type: application/json`
4. Body (raw JSON):

**Request Body:**
```json
{
  "technicianId": "{{lab_technician_id}}",
  "criticalResult": {
    "testName": "Glucose",
    "value": 45,
    "unit": "mg/dL",
    "referenceRange": "70-110",
    "criticalThreshold": "<60 or >400"
  },
  "notifiedPersons": [
    {
      "role": "ordering_physician",
      "name": "Dr. Johnson",
      "notifiedAt": "2025-11-03T11:30:00.000Z",
      "method": "phone",
      "readBack": true
    }
  ],
  "verificationSteps": [
    "Result verified by repeat testing",
    "Instrument QC checked and passed",
    "Sample integrity confirmed"
  ],
  "urgency": "immediate",
  "notes": "Patient is diabetic, immediate action required"
}
```

**Test Script (Copy to Tests tab):**
```javascript
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Critical value reported", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

console.log("✅ Critical value reported successfully");
console.log("⚠️ URGENT: Physician notification required");
```

---

### 📊 **Complete Lab Technician Workflow Example**

```
1. LOGIN
   └─> Save access_token, lab_technician_id, laboratory_id

2. VIEW LAB ORDERS (GET /api/v1/lab-orders)
   └─> Find pending orders
   └─> Save lab_order_id

3. GET ORDER DETAILS (GET /api/v1/lab-orders/{{lab_order_id}})
   └─> Review tests requested
   └─> Save test_id

4. LOG SAMPLE RECEIPT (POST .../samples/log)
   └─> Document sample arrival
   
5. UPDATE ORDER STATUS → sample_collected
   
6. RUN QUALITY CONTROL (POST .../quality-control/record)
   └─> Verify instruments are calibrated
   
7. UPDATE ORDER STATUS → in_progress
   
8. PERFORM TESTS
   
9. ADD TEST RESULTS (POST .../tests/{{test_id}}/results)
   └─> Enter values, interpretations
   
10. CHECK FOR CRITICAL VALUES
    └─> If critical, report immediately
    
11. UPDATE TEST STATUS → completed
    
12. UPDATE ORDER STATUS → completed
    
13. VIEW FINAL RESULTS (GET .../results)
    └─> Verify all tests completed
```

---

### 🎓 **Lab Technician Best Practices**

**Sample Management:**
- ✅ Always verify sample labels match order
- ✅ Check sample quality before processing
- ✅ Document storage location and conditions
- ✅ Reject compromised samples immediately

**Testing Procedures:**
- ✅ Run QC before patient samples
- ✅ Follow standard operating procedures
- ✅ Use calibrated instruments only
- ✅ Document all quality checks

**Result Reporting:**
- ✅ Double-check critical values
- ✅ Verify results against reference ranges
- ✅ Add appropriate interpretations
- ✅ Report critical values immediately

**Safety & Compliance:**
- ✅ Wear appropriate PPE
- ✅ Follow biohazard protocols
- ✅ Maintain clean work environment
- ✅ Document incidents properly

---

### 📋 **Environment Variables Checklist**

Make sure these variables are set in your Postman environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000` |
| `access_token` | JWT token | Auto-saved after login |
| `lab_technician_id` | Technician user ID | Auto-saved after login |
| `laboratory_id` | Laboratory ID | Auto-saved after login |
| `lab_order_id` | Current lab order | Auto-saved from order list |
| `test_id` | Specific test ID | Auto-saved from order details |
| `sample_id` | Sample ID | Auto-saved from sample log |

---

### ✅ **Testing Complete!**

You have successfully tested all Lab Technician operations:

- ✅ **10 Core Operations**: View lab info, manage orders, update statuses, add results
- ✅ **Sample Management**: Log receipts, track status, document quality
- ✅ **Quality Control**: Record QC, report issues, log calibrations
- ✅ **Critical Values**: Report and notify urgent results
- ✅ **Profile Management**: View and update technician information

**Next Steps:**
1. Test with real laboratory scenarios
2. Verify quality control procedures
3. Practice critical value reporting
4. Test sample tracking workflow
5. Review all test interpretations

---


Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "LabTech@123",
  "newPassword": "NewLabTech@456",
  "confirmPassword": "NewLabTech@456"
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

### Lab Technician-specific Tests
```javascript
pm.test("Lab technician has required permissions", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.user) {
        pm.expect(jsonData.data.user.role.name).to.equal('lab_technician');
    }
});

pm.test("Order belongs to technician's laboratory", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.laboratoryId) {
        pm.expect(jsonData.data.laboratoryId).to.equal(pm.environment.get("laboratory_id"));
    }
});

pm.test("Results recorded by technician", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.technicianId) {
        pm.expect(jsonData.data.technicianId).to.equal(pm.environment.get("lab_technician_id"));
    }
});
```

### Lab Results Validation Tests
```javascript
pm.test("Lab results have required components", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.results) {
        jsonData.data.results.forEach(result => {
            pm.expect(result).to.have.property('testName');
            pm.expect(result).to.have.property('components');
            pm.expect(result.components).to.be.an('array');
            result.components.forEach(component => {
                pm.expect(component).to.have.property('name');
                pm.expect(component).to.have.property('value');
                pm.expect(component).to.have.property('unit');
                pm.expect(component).to.have.property('referenceRange');
            });
        });
    }
});

pm.test("Quality control data included", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.qualityControlResults) {
        pm.expect(jsonData.data.qualityControlResults).to.be.an('object');
    }
});
```

### Critical Values Tests
```javascript
pm.test("Critical values properly flagged", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.results) {
        jsonData.data.results.forEach(result => {
            result.components.forEach(component => {
                if (component.critical) {
                    pm.expect(component).to.have.property('criticalThreshold');
                }
            });
        });
    }
});
```

---

## 🔧 Environment Variables

Required variables for lab technician operations:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "lab_technician_id": "",
  "laboratory_id": "",
  "lab_order_id": "",
  "lab_results_id": "",
  "patient_id": "",
  "doctor_id": "",
  "sample_id": "",
  "qc_id": "",
  "lab_supervisor_id": ""
}
```

---

## 📝 Notes

1. **Order Processing**: Complete workflow from sample receipt to result reporting
2. **Quality Control**: Comprehensive QC procedures and documentation
3. **Sample Management**: Full sample tracking and storage management
4. **Critical Values**: Immediate notification system for critical results
5. **Instrument Integration**: Support for automated analyzer integration
6. **Compliance**: All activities logged for regulatory compliance
7. **Turnaround Time**: Real-time tracking of processing times
8. **Result Validation**: Multi-level review and validation process

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Lab Technician Operations