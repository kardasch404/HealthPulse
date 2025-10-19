# Authorization Check - How It Works

## Security Layers

### Layer 1: Authentication (JWT Token)
**Check:** Is the user logged in?
```javascript
authenticate middleware → Verifies JWT token
```

### Layer 2: Role Check
**Check:** Is the user an admin?
```javascript
requireAdmin middleware → Checks if role === 'admin'
```

### Layer 3: Permission Check
**Check:** Can this role create users?
```javascript
canCreateUserRole middleware → Verifies admin permission
```

### Layer 4: Service Level Check
**Check:** Final verification in business logic
```javascript
UserService.createUser() → Verifies requesting user is admin
```

---

## Authorization Flow

### ✅ VALID Scenario: Admin Creates Doctor

**Request:**
```http
POST /api/v1/users
Authorization: Bearer ADMIN_TOKEN

{
  "email": "doctor@healthpulse.com",
  "password": "Doctor123!",
  "fname": "John",
  "lname": "Smith",
  "roleId": "DOCTOR_ROLE_ID"
}
```

**Flow:**
```
1. authenticate → ✅ Valid admin token
2. requireAdmin → ✅ User role is 'admin'
3. canCreateUserRole → ✅ Admin can create users
4. Validation → ✅ Input is valid
5. Service check → ✅ Requesting user is admin
6. Service check → ✅ Role exists and is active
7. Service check → ✅ Email doesn't exist
8. CREATE USER → ✅ Success!
```

**Response (200):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "...",
    "email": "doctor@healthpulse.com",
    "fname": "John",
    "lname": "Smith",
    "roleId": {
      "name": "doctor",
      "description": "Medical Doctor"
    }
  }
}
```

---

### ❌ INVALID Scenario 1: Nurse Tries to Create Doctor

**Request:**
```http
POST /api/v1/users
Authorization: Bearer NURSE_TOKEN

{
  "email": "doctor@healthpulse.com",
  "password": "Doctor123!",
  "fname": "John",
  "lname": "Smith",
  "roleId": "DOCTOR_ROLE_ID"
}
```

**Flow:**
```
1. authenticate → ✅ Valid nurse token
2. requireAdmin → ❌ BLOCKED! User role is 'nurse', not 'admin'
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

**Logged:**
```
[WARN] Admin access denied for user role: nurse
```

---

### ❌ INVALID Scenario 2: Doctor Tries to Create Patient

**Request:**
```http
POST /api/v1/users
Authorization: Bearer DOCTOR_TOKEN

{
  "email": "patient@healthpulse.com",
  "password": "Patient123!",
  "fname": "Ahmed",
  "lname": "Hassan",
  "roleId": "PATIENT_ROLE_ID"
}
```

**Flow:**
```
1. authenticate → ✅ Valid doctor token
2. requireAdmin → ❌ BLOCKED! User role is 'doctor', not 'admin'
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

### ❌ INVALID Scenario 3: Reception Tries to Create Nurse

**Request:**
```http
POST /api/v1/users
Authorization: Bearer RECEPTION_TOKEN

{
  "email": "nurse@healthpulse.com",
  "password": "Nurse123!",
  "fname": "Sarah",
  "lname": "Johnson",
  "roleId": "NURSE_ROLE_ID"
}
```

**Flow:**
```
1. authenticate → ✅ Valid reception token
2. requireAdmin → ❌ BLOCKED! User role is 'reception', not 'admin'
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

### ❌ INVALID Scenario 4: No Token Provided

**Request:**
```http
POST /api/v1/users
(No Authorization header)

{
  "email": "doctor@healthpulse.com",
  ...
}
```

**Flow:**
```
1. authenticate → ❌ BLOCKED! No token provided
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

---

### ❌ INVALID Scenario 5: Expired Token

**Request:**
```http
POST /api/v1/users
Authorization: Bearer EXPIRED_TOKEN
```

**Flow:**
```
1. authenticate → ❌ BLOCKED! Token expired
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Token has expired"
}
```

---

## Role Permission Matrix

| Requesting Role | Can Create Users? | Reason |
|----------------|-------------------|---------|
| **Admin** | ✅ Yes | Full administrative access |
| **Doctor** | ❌ No | Medical staff, not admin |
| **Nurse** | ❌ No | Medical staff, not admin |
| **Reception** | ❌ No | Front desk staff, not admin |
| **Patient** | ❌ No | End user, not admin |
| **No Auth** | ❌ No | Not authenticated |

---

## Multiple Security Checks

### Why Multiple Layers?

1. **Defense in Depth** - Multiple checkpoints
2. **Early Rejection** - Fail fast at middleware level
3. **Service Verification** - Final check in business logic
4. **Logging** - Track unauthorized attempts
5. **Audit Trail** - Know who did what

### Check Order:
```
Request
  ↓
1. JWT Valid? → No → 401 Unauthorized
  ↓ Yes
2. Is Admin? → No → 403 Forbidden
  ↓ Yes
3. Can Create? → No → 403 Forbidden
  ↓ Yes
4. Valid Input? → No → 400 Bad Request
  ↓ Yes
5. Service Check → No → 403 Forbidden
  ↓ Yes
6. Create User → Success!
```

---

## Testing Scenarios

### Test 1: Login as Different Roles
```bash
# Login as admin
POST /api/v1/auth/login
{ "email": "admin@healthpulse.health", "password": "password" }
→ Save admin_token

# Login as doctor
POST /api/v1/auth/login
{ "email": "doctor@healthpulse.com", "password": "Doctor123!" }
→ Save doctor_token

# Login as nurse
POST /api/v1/auth/login
{ "email": "nurse@healthpulse.com", "password": "Nurse123!" }
→ Save nurse_token
```

### Test 2: Try Creating User with Each Token
```bash
# ✅ With admin token - SUCCESS
POST /api/v1/users
Authorization: Bearer {{admin_token}}
{ ... user data ... }
→ 201 Created

# ❌ With doctor token - FORBIDDEN
POST /api/v1/users
Authorization: Bearer {{doctor_token}}
{ ... user data ... }
→ 403 Forbidden

# ❌ With nurse token - FORBIDDEN
POST /api/v1/users
Authorization: Bearer {{nurse_token}}
{ ... user data ... }
→ 403 Forbidden
```

### Test 3: No Token
```bash
# ❌ No authorization header - UNAUTHORIZED
POST /api/v1/users
{ ... user data ... }
→ 401 Unauthorized
```

---

## Summary

✅ **Only ADMIN can create users**  
❌ **Doctor cannot create users**  
❌ **Nurse cannot create users**  
❌ **Reception cannot create users**  
❌ **Patient cannot create users**  
❌ **No one without valid token can access**  

The system checks:
1. Is token valid?
2. Is user admin?
3. Is operation allowed?
4. Is data valid?
5. Final service verification

**All checks must pass for success!**
