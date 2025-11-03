# 🔧 Troubleshooting Guide - Permission Errors

## Problem: "You do not have permission to perform this action"

### Quick Fix ✅

**Run this command immediately:**
```bash
node scripts/update-role-permissions.js
```

**Then restart your server.**

---

## Why This Happens

When new features are added (like medical documents), new permissions are added to the code but **not automatically to the database**. Existing users have the old permissions stored in the database.

### The Solution: Migration Script

The `update-role-permissions.js` script:
1. ✅ Connects to your database
2. ✅ Updates all roles with new permissions
3. ✅ Adds `manage_medical_documents` and `view_medical_documents`
4. ✅ Updates: Doctor, Nurse, Lab Technician, Admin, Patient roles

---

## Step-by-Step Fix

### 1. Stop the Server
```bash
# Press Ctrl+C in the terminal where server is running
# Or run:
pkill -f "node.*app.js"
```

### 2. Run Migration
```bash
cd /home/kardasch/Desktop/HealthPulse
node scripts/update-role-permissions.js
```

**Expected output:**
```
✅ Updated doctor role with 12 permissions
   New permissions: manage_medical_documents, view_medical_documents
✅ Updated nurse role with 7 permissions
   New permissions: manage_medical_documents, view_medical_documents
...
✨ Migration completed successfully!
```

### 3. Restart Server
```bash
npm start
# or
node app.js
```

### 4. Test Again
Now try your Postman request again. It should work!

---

## Verify It Worked

### Test the Doctor Upload Endpoint

**Request:**
```
POST http://localhost:3000/api/v1/documents
```

**Headers:**
```
Authorization: Bearer YOUR_DOCTOR_TOKEN
```

**Body (form-data):**
```
file: [any PDF file]
patientId: [valid patient ID]
documentType: consultation_note
title: Test Document
description: Testing permissions
category: clinical
```

**Expected:** ✅ Status 201 Created

**If you still get error:** ⚠️ See below

---

## Still Getting Errors?

### Error 1: "You do not have permission..."
**Cause:** Role permissions not updated in database
**Fix:** 
```bash
node scripts/update-role-permissions.js
# Restart server
```

### Error 2: "Invalid token" / 401 Unauthorized
**Cause:** Token expired or invalid
**Fix:**
1. Login again to get new token
2. Copy the `accessToken` from response
3. Update your Postman environment variable

### Error 3: "No file uploaded"
**Cause:** Wrong body type in Postman
**Fix:**
1. Use **form-data** not raw JSON
2. Set file key type to **File** not Text
3. Click "Select Files" to choose file

### Error 4: "File type not allowed"
**Cause:** Unsupported file format
**Fix:**
- Use: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT, JSON only
- Check file size is under 10MB

### Error 5: "Patient not found"
**Cause:** Invalid patientId
**Fix:**
1. First get a valid patient ID:
   ```
   GET http://localhost:3000/api/v1/patients
   ```
2. Copy a patient `_id` from response
3. Use that in `patientId` field

---

## Check Your Role Permissions

### Via MongoDB
```bash
mongosh mongodb://localhost:27018/healthpulse
db.roles.find({ name: "doctor" }, { permissions: 1 })
```

**Should see:**
```javascript
{
  permissions: [
    'manage_patients',
    'manage_appointments',
    // ... other permissions ...
    'manage_medical_documents',  // ← Should be here
    'view_medical_documents'     // ← Should be here
  ]
}
```

### Via API (if implemented)
```
GET http://localhost:3000/api/v1/roles
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## Common Testing Mistakes

### ❌ Wrong: Using raw JSON for file upload
```json
{
  "file": "document.pdf",
  "patientId": "123"
}
```

### ✅ Correct: Using form-data
```
Body → form-data
file: [File] → Select file
patientId: [Text] → 507f1f77bcf86cd799439013
documentType: [Text] → consultation_note
```

---

## Permission Requirements by Role

| Role | Upload Documents | View Documents | Process Lab Results |
|------|------------------|----------------|---------------------|
| Admin | ✅ Yes | ✅ Yes | ✅ Yes |
| Doctor | ✅ Yes | ✅ Yes | ❌ No |
| Nurse | ✅ Yes | ✅ Yes | ❌ No |
| Lab Technician | ✅ Yes | ✅ Yes | ✅ Yes |
| Patient | ❌ No | ✅ Own only | ❌ No |
| Pharmacist | ❌ No | ❌ No | ❌ No |

---

## Testing Checklist

Before opening an issue, verify:

- [ ] Ran `node scripts/update-role-permissions.js`
- [ ] Server restarted after migration
- [ ] Using valid JWT token (not expired)
- [ ] User has correct role (doctor, nurse, lab_technician)
- [ ] Using form-data for file uploads
- [ ] File type is supported (PDF, JPG, PNG, etc.)
- [ ] File size under 10MB
- [ ] patientId is valid and exists
- [ ] MongoDB is running
- [ ] MinIO is running (for file storage)

---

## Get Help

### Check Server Logs
```bash
# Look for permission-related errors
tail -f logs/app.log

# Or check console output
```

### Check Database Connection
```bash
node scripts/checkDb.js
```

### Verify MinIO is Running
```bash
docker ps | grep minio
# or
curl http://localhost:9000/minio/health/live
```

---

## Prevention

### For New Developers

1. **Always run migrations** when pulling new code:
   ```bash
   node scripts/update-role-permissions.js
   ```

2. **Restart server** after migrations

3. **Check documentation** for new permissions

4. **Test with fresh login** if getting permission errors

---

## Quick Reference Commands

```bash
# Update permissions
node scripts/update-role-permissions.js

# Restart server
pkill -f "node.*app.js" && npm start

# Check database
node scripts/checkDb.js

# Reset everything (careful!)
node scripts/seed.js

# View logs
tail -f logs/app.log
```

---

**🎯 TL;DR:**
1. Run: `node scripts/update-role-permissions.js`
2. Restart server
3. Try again
4. Should work! 🎉

**📚 Related Docs:**
- [Doctor Medical Documents Guide](./DOCTOR_MEDICAL_DOCUMENTS_POSTMAN_GUIDE.md)
- [Lab Technician Guide](./LAB_TECHNICIAN_POSTMAN_GUIDE.md)
- [Quick Start Guide](./QUICK_START_FILE_UPLOADS.md)
