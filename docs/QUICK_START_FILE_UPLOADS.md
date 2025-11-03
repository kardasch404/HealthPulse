# 🚀 Quick Start Testing Guide

## ⚠️ REQUIRED FIRST STEP

**Before testing anything, run this command:**
```bash
node scripts/update-role-permissions.js
```

This updates role permissions in the database. **Skip this and you'll get permission errors!**

---

## Fast Track: Test File Uploads in 5 Minutes

### Step 1: Login (30 seconds)
```
POST http://localhost:3000/api/v1/auth/login

Body:
{
  "email": "lab.technician@hospital.com",
  "password": "YourPassword"
}

→ Save the accessToken from response
```

### Step 2: Get a Lab Order ID (30 seconds)
```
GET http://localhost:3000/api/v1/lab-orders?status=pending

Headers:
Authorization: Bearer YOUR_TOKEN

→ Copy a lab order _id from response
```

### Step 3: Upload JSON Results (1 minute)
```
POST http://localhost:3000/api/v1/lab-orders/{LAB_ORDER_ID}/upload-results

Headers:
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

Body:
{
  "tests": [{
    "testId": "GET_FROM_LAB_ORDER",
    "results": {
      "WBC": {"value": 7.5, "unit": "10^3/μL", "referenceRange": "4.0-11.0", "status": "normal"}
    },
    "interpretation": "Normal range"
  }]
}
```

### Step 4: Upload PDF Report (1 minute)
```
POST http://localhost:3000/api/v1/lab-orders/{LAB_ORDER_ID}/upload-report

Headers:
Authorization: Bearer YOUR_TOKEN

Body (form-data):
- file: [SELECT YOUR PDF FILE]
- title: Lab Report Test
- description: Test upload
```

### Step 5: Upload Medical Document (1 minute)
```
POST http://localhost:3000/api/v1/documents

Headers:
Authorization: Bearer YOUR_TOKEN

Body (form-data):
- file: [SELECT ANY FILE - PDF/JPG/PNG]
- patientId: GET_FROM_LAB_ORDER
- documentType: consultation_note
- title: Test Document
- description: Testing file upload
- category: clinical
- tags: ["test"]
```

### Step 6: List Documents (30 seconds)
```
GET http://localhost:3000/api/v1/documents/patient/{PATIENT_ID}

Headers:
Authorization: Bearer YOUR_TOKEN
```

### Step 7: Download Document (30 seconds)
```
GET http://localhost:3000/api/v1/documents/{DOCUMENT_ID}/download

Headers:
Authorization: Bearer YOUR_TOKEN

→ Click "Save Response" → "Save to a file"
```

---

## ⚡ Postman Form-Data Setup

### For File Uploads:
1. Click **Body** tab
2. Select **form-data** (NOT raw)
3. Add keys:
   - `file` → Type: **File** → Click "Select Files"
   - `title` → Type: **Text** → Enter text
   - `description` → Type: **Text** → Enter text
   - `tags` → Type: **Text** → Enter: `["tag1", "tag2"]`

---

## 🎯 All Available Endpoints

### Lab Technician Endpoints
- `POST /lab-orders/:id/upload-results` - Upload JSON results
- `POST /lab-orders/:id/upload-report` - Upload PDF (form-data)
- `POST /lab-orders/:id/validate` - Mark as validated
- `GET /lab-orders/:id/result-history` - View history

### Medical Documents Endpoints
- `POST /documents` - Upload document (form-data)
- `GET /documents/patient/:patientId` - List documents
- `GET /documents/:id` - Get document details
- `GET /documents/:id/download` - Download file
- `PUT /documents/:id` - Update metadata
- `DELETE /documents/:id` - Delete document
- `GET /documents/consultation/:id` - Consultation docs
- `GET /documents/lab-order/:id` - Lab order docs

---

## 📄 Document Types Available

- `lab_report` - Lab test reports
- `prescription` - Prescriptions
- `consultation_note` - Doctor notes
- `imaging_scan` - X-rays, CT, MRI
- `discharge_summary` - Hospital discharge
- `referral_letter` - Referrals
- `consent_form` - Consent forms
- `medical_certificate` - Certificates
- `other` - Other documents

---

## ✅ Quick Validation

### Test That It Works:
1. ✅ Login returns token
2. ✅ Can upload JSON results
3. ✅ Can upload PDF with form-data
4. ✅ Can upload various file types
5. ✅ Can list uploaded documents
6. ✅ Can download documents
7. ✅ Files appear with correct metadata

---

## 🔧 Troubleshooting

### "No file uploaded"
- Use **form-data** not raw JSON
- Set key type to **File**

### "File type not allowed"
- Use: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT, JSON
- Max size: 10MB

### "Permission denied"
- Check you're logged in
- Verify role has correct permissions

### "Token expired"
- Login again to get new token

---

## 📚 Full Documentation

- **Lab Technician:** `/docs/LAB_TECHNICIAN_POSTMAN_GUIDE.md`
- **Doctor Documents:** `/docs/DOCTOR_MEDICAL_DOCUMENTS_POSTMAN_GUIDE.md`
- **Implementation:** `/docs/MEDICAL_DOCUMENTS_IMPLEMENTATION.md`

---

**🎉 That's it! You're ready to test file uploads!**
