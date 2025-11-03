# 🐳 Docker Permission Fix Guide

## Problem
You're running the app in **Docker** and getting permission errors even after updating the database.

**Error:**
```
[WARN] Access denied: User role doctor does not have permission manage_medical_documents
```

## Why This Happens
Docker containers use a **snapshot** of your code. When you:
1. ✅ Updated `constants/roles.js` with new permissions
2. ✅ Ran migration to update database

But Docker is still running the **old code**!

---

## Solution: Restart Docker Containers

### Option 1: Quick Restart (Recommended)
```bash
cd /home/kardasch/Desktop/HealthPulse
docker-compose restart
```

This restarts the containers and picks up code changes (if using volumes).

---

### Option 2: Rebuild (If restart doesn't work)
```bash
cd /home/kardasch/Desktop/HealthPulse
docker-compose down
docker-compose up --build -d
```

This rebuilds the image with your new code.

---

### Option 3: Force Complete Rebuild
```bash
cd /home/kardasch/Desktop/HealthPulse

# Stop containers
docker-compose down

# Remove old images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache

# Start containers
docker-compose up -d
```

---

## After Restarting Docker

### 1. Check Logs
```bash
docker-compose logs -f app
```

Look for:
```
✅ Server running on port 3000
✅ Database connected successfully
```

### 2. Run Migration in Docker
```bash
docker-compose exec app node scripts/update-role-permissions.js
```

**Or** if you already ran it locally, it's already in the database (skip this).

### 3. Test in Postman

**Login again** (get fresh token):
```
POST http://localhost:3000/api/v1/auth/login

{
  "email": "doctor1@healthpulse.com",
  "password": "YourPassword"
}
```

**Upload document**:
```
POST http://localhost:3000/api/v1/documents

Headers:
Authorization: Bearer NEW_TOKEN

Body (form-data):
file: [Select PDF]
patientId: [Valid patient ID]
documentType: consultation_note
title: Test Upload
description: Testing after Docker restart
category: clinical
```

---

## Complete Docker Setup Workflow

### If Starting Fresh
```bash
# 1. Navigate to project
cd /home/kardasch/Desktop/HealthPulse

# 2. Start containers
docker-compose up -d

# 3. Wait for services to be ready (30 seconds)
sleep 30

# 4. Run migration inside Docker
docker-compose exec app node scripts/update-role-permissions.js

# 5. Check logs
docker-compose logs -f app
```

---

## Verify It's Working

### Check Docker Logs for Permissions
```bash
docker-compose logs app | grep "manage_medical_documents"
```

Should show the permission is loaded.

### Check Docker is Using New Code
```bash
# Enter Docker container
docker-compose exec app bash

# Check the roles file
cat app/constants/roles.js | grep -A 15 "ROLES.DOCTOR"
```

Should show:
```javascript
PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS,
PERMISSIONS.VIEW_MEDICAL_DOCUMENTS
```

---

## Common Docker Issues

### Issue 1: Code Changes Not Reflected
**Problem:** Docker still using old code
**Solution:**
```bash
docker-compose down
docker-compose up --build -d
```

### Issue 2: Database Not Updated
**Problem:** Migration didn't run in Docker
**Solution:**
```bash
docker-compose exec app node scripts/update-role-permissions.js
```

### Issue 3: Can't Connect to MongoDB
**Problem:** MongoDB not ready when app starts
**Solution:**
```bash
docker-compose restart app
```

### Issue 4: Port Already in Use
**Problem:** Port 3000 already taken
**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 [PID]

# Or change port in docker-compose.yml
```

---

## Docker vs Local Development

### Docker (Current Setup)
- ✅ Containers isolated
- ✅ Consistent environment
- ⚠️ Need to rebuild for code changes
- ⚠️ Migration runs inside container

**Commands:**
```bash
docker-compose up -d              # Start
docker-compose restart            # Restart
docker-compose logs -f app        # View logs
docker-compose exec app [cmd]    # Run command inside
docker-compose down               # Stop
```

### Local (Alternative)
- ✅ Instant code changes
- ✅ Easier debugging
- ⚠️ Need to install dependencies locally

**Commands:**
```bash
npm install                       # Install deps
node scripts/update-role-permissions.js  # Migration
npm start                         # Start server
```

---

## Quick Fix Checklist

When getting permission errors in Docker:

- [ ] Stop containers: `docker-compose down`
- [ ] Rebuild: `docker-compose up --build -d`
- [ ] Wait 30 seconds for services to start
- [ ] Run migration: `docker-compose exec app node scripts/update-role-permissions.js`
- [ ] Check logs: `docker-compose logs -f app`
- [ ] Login again in Postman (new token)
- [ ] Test upload endpoint
- [ ] Should work! ✅

---

## Useful Docker Commands

```bash
# View all containers
docker ps

# View app logs
docker-compose logs -f app

# View MongoDB logs
docker-compose logs -f mongo

# Enter app container
docker-compose exec app bash

# Enter MongoDB container
docker-compose exec mongo mongosh

# Restart specific service
docker-compose restart app

# Stop all
docker-compose down

# Start all
docker-compose up -d

# Rebuild specific service
docker-compose build app

# Clean everything (careful!)
docker-compose down -v
docker system prune -a
```

---

## Check Status

### All Services Running?
```bash
docker-compose ps
```

Should show:
```
NAME                COMMAND              STATUS
healthpulse_app     "node app.js"       Up
healthpulse_mongo   "mongod"            Up
healthpulse_minio   "minio server"      Up
```

### Check Environment
```bash
docker-compose exec app env | grep MONGODB_URI
```

---

## Summary

**Your issue:** Docker container is running old code without new permissions.

**Quick fix:**
```bash
docker-compose restart
```

**If that doesn't work:**
```bash
docker-compose down
docker-compose up --build -d
docker-compose exec app node scripts/update-role-permissions.js
```

**Then:** Login again in Postman with new token and test!

---

**Need more help?**
- Check: `docker-compose logs -f app`
- See: `TROUBLESHOOTING_PERMISSIONS.md`
- Verify: Roles file has new permissions in container
