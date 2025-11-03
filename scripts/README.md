# Scripts Directory

This directory contains utility scripts for database management, migrations, and maintenance.

## 🔧 Available Scripts

### Migration Scripts

#### `update-role-permissions.js` ⭐ **IMPORTANT**
Updates role permissions in the database with new permissions.

**When to run:**
- After pulling new code with permission changes
- When getting "permission denied" errors
- After new features are added

**Usage:**
```bash
node scripts/update-role-permissions.js
```

**What it does:**
- Connects to MongoDB
- Updates all roles with latest permissions from `constants/roles.js`
- Adds new permissions (e.g., `manage_medical_documents`, `view_medical_documents`)
- Shows summary of updated roles

**Example output:**
```
✅ Updated doctor role with 12 permissions
   New permissions: manage_medical_documents, view_medical_documents
✨ Migration completed successfully!
```

---

### Database Management Scripts

#### `seed.js`
Seeds the database with initial data (users, roles, patients, etc.)

**Usage:**
```bash
node scripts/seed.js
```

**⚠️ Warning:** This will reset all data!

---

#### `initDb.js`
Initializes the database with required collections and indexes

**Usage:**
```bash
node scripts/initDb.js
```

---

#### `checkDb.js`
Checks database connection and displays status

**Usage:**
```bash
node scripts/checkDb.js
```

**What it checks:**
- MongoDB connection
- Database name
- Available collections
- Basic statistics

---

#### `reset-passwords.js`
Resets user passwords (useful for development/testing)

**Usage:**
```bash
node scripts/reset-passwords.js
```

---

#### `fixTerminIndexes.js`
Fixes appointment (termin) indexes in the database

**Usage:**
```bash
node scripts/fixTerminIndexes.js
```

---

## 📝 Common Workflows

### Setting Up New Development Environment

```bash
# 1. Install dependencies
npm install

# 2. Initialize database
node scripts/initDb.js

# 3. Seed with test data
node scripts/seed.js

# 4. Update permissions
node scripts/update-role-permissions.js

# 5. Start server
npm start
```

---

### After Pulling New Code

```bash
# 1. Install any new dependencies
npm install

# 2. Update role permissions
node scripts/update-role-permissions.js

# 3. Restart server
npm restart
```

---

### Troubleshooting Permission Errors

```bash
# 1. Update permissions
node scripts/update-role-permissions.js

# 2. Check database status
node scripts/checkDb.js

# 3. Restart server
pkill -f "node.*app.js" && npm start
```

---

### Reset Everything (Development Only)

```bash
# ⚠️ This will delete all data!

# 1. Stop server
pkill -f "node.*app.js"

# 2. Seed database
node scripts/seed.js

# 3. Update permissions
node scripts/update-role-permissions.js

# 4. Start server
npm start
```

---

## 🔐 Environment Variables

Scripts use the following environment variables from `.env`:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret for token generation
- Other app-specific variables

Make sure your `.env` file is configured before running scripts.

---

## 📚 Creating New Scripts

### Template for Database Scripts

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const myScript = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Your script logic here

        console.log('✨ Script completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
};

myScript();
```

---

## 🆘 Getting Help

If a script fails:

1. Check MongoDB is running
2. Verify `.env` file exists and is configured
3. Check console output for specific errors
4. Review the script documentation above
5. See [Troubleshooting Guide](../docs/TROUBLESHOOTING_PERMISSIONS.md)

---

## 📂 Script Files

```
scripts/
├── checkDb.js                      # Check database status
├── fixTerminIndexes.js             # Fix appointment indexes
├── initDb.js                       # Initialize database
├── reset-passwords.js              # Reset user passwords
├── seed.js                         # Seed test data
├── update-role-permissions.js      # Update role permissions ⭐
└── README.md                       # This file
```

---

**Last Updated:** January 2024  
**Maintained by:** HealthPulse Development Team
