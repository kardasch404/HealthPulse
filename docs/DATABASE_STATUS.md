# HealthPulse Database & Logging System

## 📊 Database Status

### Current Database: `healthpulse`
**Connection**: `mongodb://localhost:27018/healthpulse`

### Collections Created (9 total):
✅ All collections have been initialized with proper indexes

1. **users** - User accounts (doctors, patients, admin, etc.)
2. **patients** - Patient records
3. **roles** - User roles and permissions
4. **termins** - Appointments/Consultations scheduling
5. **consultations** - Medical consultation records
6. **prescriptions** - Electronic prescriptions
7. **pharmacies** - Pharmacy information
8. **laboratories** - Laboratory information
9. **refreshtokens** - JWT refresh tokens

### Your Other Database: `kardasch`
✅ **SAFE** - All your original data is intact
- socials, competences, educations, users, experiences, _init, projects

---

## 📁 Logging System

### Log Files Location
```
/home/kardasch/Desktop/HealthPulse/logs/
```

### Log Files Created
- `app-YYYY-MM-DD.log` - All application logs (info, warnings, errors, debug)
- `error-YYYY-MM-DD.log` - Error logs only

### Log Features
✅ Automatic daily log file creation
✅ Timestamps for all log entries
✅ Separate error tracking
✅ Console output + file storage
✅ JSON formatting for structured data

### Using Logger in Your Code
```javascript
import Logger from './app/logs/Logger.js';

// Log info
Logger.info('User logged in', { userId: user.id });

// Log errors
Logger.error('Failed to save data', error);

// Log warnings
Logger.warn('Low disk space', { available: '10GB' });

// Log debug (only in development)
Logger.debug('Processing request', { data });

// Log database operations
Logger.database('Collection created', { name: 'users' });

// Log API requests
Logger.api('GET', '/api/users', 200, 45); // method, path, status, duration(ms)
```

---

## 🛠️ Utility Scripts

### 1. Check Database Status
```bash
node scripts/checkDb.js
```
Shows all collections, document counts, and indexes

### 2. Initialize Database
```bash
node scripts/initDb.js
```
Creates all collections with proper indexes

---

## 📋 Database Collections Details

### users
- **Documents**: 0
- **Indexes**: 3 (email [UNIQUE], phone [UNIQUE])

### patients
- **Documents**: 0  
- **Indexes**: 7 (fname+lname, email, phone, assignedDoctorId, createdBy, createdAt)

### termins (Appointments)
- **Documents**: 0
- **Indexes**: 6 (patientId+date, doctorId+date+startTime, date+status, status, createdBy)

### consultations
- **Documents**: 0
- **Indexes**: 5 (patientId+date, doctorId+date, status, appointmentId)

### prescriptions
- **Documents**: 0
- **Indexes**: 7 (prescriptionNumber [UNIQUE], patientId+date, doctorId+date, status, pharmacy, consultation)

### pharmacies
- **Documents**: 0
- **Indexes**: 7 (pharmacyId [UNIQUE], city, coordinates, name [TEXT SEARCH])

### laboratories
- **Documents**: 0
- **Indexes**: 7 (laboratoryId [UNIQUE], city, testCodes, name [TEXT SEARCH])

### roles
- **Documents**: 0
- **Indexes**: 2 (name [UNIQUE])

### refreshtokens
- **Documents**: 0
- **Indexes**: 4 (token [UNIQUE], userId, expiresAt)

---

## 🚀 Quick Start

### Start MongoDB Container
```bash
sudo docker start docker_mongo_1
```

### Check Database
```bash
node scripts/checkDb.js
```

### View Logs
```bash
# View all logs
tail -f logs/app-2025-11-02.log

# View only errors  
tail -f logs/error-2025-11-02.log

# Search logs
grep "ERROR" logs/app-2025-11-02.log
```

---

## ✅ Summary

### What Was Done:
1. ✅ Enhanced Logger with file storage
2. ✅ Created 9 database collections with indexes
3. ✅ All your original data in 'kardasch' database is **SAFE**
4. ✅ Created utility scripts for database management
5. ✅ Automatic log file creation with timestamps
6. ✅ Improved database connection with logging

### Your Data Status:
- **healthpulse database**: ✅ Created with 9 empty collections
- **kardasch database**: ✅ Safe with all original data intact

### MongoDB Status:
- **Container**: docker_mongo_1 (Running)
- **Port**: 27018
- **Host**: localhost

---

## 📝 Notes

- Log files are created daily with date stamps
- Indexes are automatically applied when collections are created
- All database operations are logged
- Error logs are stored separately for easy debugging
- The system is production-ready

---

**Generated**: November 2, 2025