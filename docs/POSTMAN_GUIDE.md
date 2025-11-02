# User Management API - Postman Guide

## Setup

### Environment Variables
Create these variables in your Postman environment:

```
baseurl = http://localhost:3000/api/v1
admin_token = (will be set after login)
doctor_role_id = (will be set after getting roles)
nurse_role_id = (will be set after getting roles)
reception_role_id = (will be set after getting roles)
patient_role_id = (will be set after getting roles)
```

---

## 1. Admin Login

**Request:** `POST {{baseurl}}/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@healthpulse.health",
  "password": "password"
}
```

**Test Script:** (Auto-save token)
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('admin_token', response.data.accessToken);
    console.log('✅ Admin token saved');
}
```

---

## 2. Get All Roles

**Request:** `GET {{baseurl}}/roles`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Test Script:** (Auto-save role IDs)
```javascript
if (pm.response.code === 200) {
    const roles = pm.response.json().data;
    
    roles.forEach(role => {
        if (role.name === 'admin') {
            pm.collectionVariables.set('admin_role_id', role._id);
        } else if (role.name === 'doctor') {
            pm.collectionVariables.set('doctor_role_id', role._id);
        } else if (role.name === 'nurse') {
            pm.collectionVariables.set('nurse_role_id', role._id);
        } else if (role.name === 'reception') {
            pm.collectionVariables.set('reception_role_id', role._id);
        } else if (role.name === 'patient') {
            pm.collectionVariables.set('patient_role_id', role._id);
        }
    });
    
    console.log('✅ All role IDs saved');
}
```

---

## 3. Create Doctor Account

**Request:** `POST {{baseurl}}/users`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "doctor@healthpulse.com",
  "password": "Doctor123!",
  "fname": "John",
  "lname": "Smith",
  "phone": "0612345679",
  "roleId": "{{doctor_role_id}}"
}
```

---

## 4. Create Nurse Account

**Request:** `POST {{baseurl}}/users`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "nurse@healthpulse.com",
  "password": "Nurse123!",
  "fname": "Sarah",
  "lname": "Johnson",
  "phone": "0612345680",
  "roleId": "{{nurse_role_id}}"
}
```

---

## 5. Create Reception Account

**Request:** `POST {{baseurl}}/users`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "reception@healthpulse.com",
  "password": "Reception123!",
  "fname": "Maria",
  "lname": "Garcia",
  "phone": "0612345681",
  "roleId": "{{reception_role_id}}"
}
```

---

## 6. Create Patient Account

**Request:** `POST {{baseurl}}/users`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "patient@healthpulse.com",
  "password": "Patient123!",
  "fname": "Ahmed",
  "lname": "Hassan",
  "phone": "0612345682",
  "roleId": "{{patient_role_id}}"
}
```

---

## 7. Get All Users (with pagination)

**Request:** `GET {{baseurl}}/users?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

---

## 8. Get Users by Role

**Request:** `GET {{baseurl}}/users/role/doctor`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

Replace `doctor` with `nurse`, `reception`, or `patient` as needed.

---

## 9. Get User by ID

**Request:** `GET {{baseurl}}/users/:userId`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

---

## 10. Update User

**Request:** `PUT {{baseurl}}/users/:userId`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "fname": "UpdatedFirstName",
  "lname": "UpdatedLastName",
  "phone": "0698765432"
}
```

---

## 11. Deactivate User

**Request:** `DELETE {{baseurl}}/users/:userId`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

---

## 12. Activate User

**Request:** `PATCH {{baseurl}}/users/:userId/activate`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

---

## Filter Users

**Get Active Users Only:**
```
GET {{baseurl}}/users?isActive=true
```

**Get Users by Role with Pagination:**
```
GET {{baseurl}}/users?role=doctor&page=1&limit=5
```

---

## Error Responses

All endpoints return consistent error format:

**Success Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Security Notes

1. **All user management endpoints require:**
   - Valid JWT token in Authorization header
   - Admin role

2. **Automatic validations:**
   - Email uniqueness
   - Phone uniqueness
   - Role existence and active status
   - Password strength (min 6 characters)
   - Name length (2-50 characters)
   - Phone format (10 digits)

3. **Error handling:**
   - All errors are handled by global error middleware
   - Detailed validation errors
   - Proper HTTP status codes
   - Development vs production error details
