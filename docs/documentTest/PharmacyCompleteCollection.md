# HealthPulse API - Complete Pharmacy Operations Collection

## 📋 Pharmacy Collection Overview

This document provides complete API documentation for all pharmacy operations in the HealthPulse system, including proper data structures, validation requirements, and testing procedures.

---

## 🔐 Authentication

### Admin Login (Required for most operations)
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
    pm.environment.set("admin_id", response.data.user.id);
}
```

---

## 📁 Pharmacy Management Operations

### 📂 Valid Service Enum Values

**Important:** The `services` field only accepts these specific values:
- `prescription_filling`
- `otc_medications`
- `home_delivery`
- `24h_service`
- `night_service`
- `vaccination`
- `health_screening`
- `blood_pressure_check`
- `diabetes_monitoring`
- `covid_testing`
- `medical_equipment`
- `consultation`

---

### 📂 CRUD Operations

#### **1. Register Partner Pharmacy**
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
    "street": "123 Avenue Mohammed V",
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
  "insuranceAccepted": ["CNSS", "CNOPS", "Private"],
  "socialMedia": {
    "facebook": "https://facebook.com/chifa-pharmacy",
    "whatsapp": "+212661234567"
  }
}
```

**Test Script:**
```javascript
pm.test("Pharmacy created successfully", function () {
    pm.response.to.have.status(201);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.environment.set("pharmacy_id", jsonData.data._id);
});

pm.test("Pharmacy has auto-generated ID", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.pharmacyId).to.match(/^PH-\d+-[a-z0-9]+$/);
});
```

#### **2. Get All Pharmacies**
```http
GET {{base_url}}/api/v1/pharmacies?page=1&limit=10&status=active
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): active/suspended/inactive/pending_approval
- `city` (optional): Filter by city name
- `hasDelivery` (optional): true/false

**Test Script:**
```javascript
pm.test("Pharmacies list retrieved", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
    pm.expect(jsonData.pagination).to.have.property('total');
});
```

#### **3. Get Pharmacy by ID**
```http
GET {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
```

#### **4. Update Pharmacy Info**
```http
PUT {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "contact": {
    "phone": "+212661234568",
    "email": "updated@chifa-pharmacy.com"
  },
  "services": ["prescription_filling", "consultation", "home_delivery", "vaccination", "covid_testing"],
  "deliveryService": {
    "available": true,
    "deliveryRadius": 15,
    "deliveryFee": 20
  }
}
```

#### **5. Delete Pharmacy**
```http
DELETE {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}
Authorization: Bearer {{access_token}}
```

---

### 📂 Status Management

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
  "reason": "License renewal pending"
}
```

#### **Verify Pharmacy**
```http
PATCH {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/verify
Authorization: Bearer {{access_token}}
```

---

### 📂 Search and Discovery

#### **Search Pharmacies by Name/Location**
```http
GET {{base_url}}/api/v1/pharmacies/search?q=Chifa
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `q` (required): Search term (name, city, street)

#### **Search by Services**
```http
GET {{base_url}}/api/v1/pharmacies/search/services?services=vaccination,home_delivery&city=Casablanca
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `services` (required): Comma-separated service list
- `city` (optional): Filter by city

#### **Get Nearby Pharmacies**
```http
GET {{base_url}}/api/v1/pharmacies/nearby?latitude=33.5731&longitude=-7.5898&radius=5
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `latitude` (required): GPS latitude
- `longitude` (required): GPS longitude
- `radius` (optional): Search radius in km (default: 10)

---

### 📂 Statistics and Analytics

#### **Get Pharmacy Statistics**
```http
GET {{base_url}}/api/v1/pharmacies/stats
Authorization: Bearer {{access_token}}
```

**Response includes:**
- Total pharmacies
- Active pharmacies
- Suspended pharmacies
- Pending approval
- With delivery service
- With 24h service

---

### 📂 Staff Management

#### **Add Pharmacist to Pharmacy**
```http
POST {{base_url}}/api/v1/pharmacies/{{pharmacy_id}}/pharmacists
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "{{pharmacist_user_id}}",
  "name": "Dr. Ahmed Hassan",
  "phone": "+212661234567",
  "email": "ahmed.hassan@chifa-pharmacy.com",
  "workSchedule": [
    {
      "day": "monday",
      "startTime": "08:00",
      "endTime": "16:00"
    },
    {
      "day": "tuesday",
      "startTime": "08:00",
      "endTime": "16:00"
    }
  ]
}
```

---

## 🧪 Complete Test Collection

### Pre-request Script (Collection Level)
```javascript
// Auto token refresh
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

### Common Test Scripts

#### Success Response Test
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

#### Pharmacy Data Validation
```javascript
pm.test("Pharmacy data structure is valid", function () {
    const jsonData = pm.response.json();
    if (jsonData.data && !Array.isArray(jsonData.data)) {
        pm.expect(jsonData.data).to.have.property('name');
        pm.expect(jsonData.data).to.have.property('licenseNumber');
        pm.expect(jsonData.data).to.have.property('contact');
        pm.expect(jsonData.data).to.have.property('address');
        pm.expect(jsonData.data.contact).to.have.property('phone');
        pm.expect(jsonData.data.address).to.have.property('city');
    }
});

pm.test("Services are valid", function () {
    const jsonData = pm.response.json();
    const validServices = [
        'prescription_filling', 'otc_medications', 'home_delivery',
        '24h_service', 'night_service', 'vaccination', 'health_screening',
        'blood_pressure_check', 'diabetes_monitoring', 'covid_testing',
        'medical_equipment', 'consultation'
    ];
    
    if (jsonData.data && jsonData.data.services) {
        jsonData.data.services.forEach(service => {
            pm.expect(validServices).to.include(service);
        });
    }
});
```

#### Location Tests
```javascript
pm.test("Coordinates are valid", function () {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.address && jsonData.data.address.coordinates) {
        const coords = jsonData.data.address.coordinates;
        pm.expect(coords.latitude).to.be.within(-90, 90);
        pm.expect(coords.longitude).to.be.within(-180, 180);
    }
});
```

#### Phone Number Validation
```javascript
pm.test("Phone number format is valid", function () {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.contact && jsonData.data.contact.phone) {
        const phone = jsonData.data.contact.phone;
        pm.expect(phone).to.match(/^(\+212|0)[5-7]\d{8}$/);
    }
});
```

---

## 🔧 Environment Variables

Required variables for pharmacy operations:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "refresh_token": "",
  "admin_id": "",
  "pharmacy_id": "",
  "pharmacist_user_id": ""
}
```

---

## 📝 Testing Workflow

### 1. Setup Phase
1. Set environment variables
2. Login as admin
3. Verify token is set

### 2. CRUD Testing
1. Create pharmacy with valid data
2. Verify pharmacy was created
3. Get pharmacy by ID
4. Update pharmacy information
5. Test status changes (activate/suspend/verify)

### 3. Search Testing
1. Search by name
2. Search by services
3. Search by location
4. Test nearby pharmacies

### 4. Error Testing
1. Test with invalid services
2. Test with invalid phone numbers
3. Test without authentication
4. Test with non-existent IDs

### 5. Cleanup
1. Delete test pharmacy
2. Verify deletion

---

## 🚨 Common Issues and Solutions

### Issue 1: Invalid Service Values
**Error:** `services.0: 'Prescription Dispensing' is not a valid enum value`

**Solution:** Use only valid enum values:
```json
{
  "services": ["prescription_filling", "consultation", "home_delivery"]
}
```

### Issue 2: Phone Number Validation
**Error:** `Please provide a valid Moroccan phone number`

**Solution:** Use Moroccan format:
```json
{
  "contact": {
    "phone": "+212661234567"
  }
}
```

### Issue 3: Address Structure
**Error:** Missing required address fields

**Solution:** Include all required address fields:
```json
{
  "address": {
    "street": "123 Street Name",
    "city": "Casablanca",
    "zipCode": "20000"
  }
}
```

---

**Last Updated:** November 2, 2024  
**API Version:** 1.0  
**Collection Type:** Complete Pharmacy Operations