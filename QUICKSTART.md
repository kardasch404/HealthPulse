# HealthPulse - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Project Structure
```
HealthPulse/
├── backend/          # Node.js + Express + MongoDB
└── frontend/         # React + TypeScript + Redux Toolkit
```

## Backend Setup

### 1. Navigate to Backend
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# .env file should have:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/healthpulse
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
```

### 4. Enable CORS
Add to `backend/app.js`:
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

### 5. Start Backend
```bash
npm start
# Backend running on http://localhost:3000
```

## Frontend Setup

### 1. Navigate to Frontend (New Terminal)
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Already Configured
```bash
# .env already has:
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=HealthPulse
```

### 4. Start Frontend
```bash
npm run dev
# Frontend running on http://localhost:5173
```

## 🎯 Test the Application

### 1. Register a New User
- Visit: `http://localhost:5173/register`
- Fill in the form:
  - First Name: John
  - Last Name: Doe
  - Email: john.doe@example.com
  - Phone: +1234567890 (optional)
  - Role: Patient (or any role)
  - Password: password123
  - Confirm Password: password123
- Click "Create Account"

### 2. Login
- Visit: `http://localhost:5173/login`
- Email: john.doe@example.com
- Password: password123
- Click "Sign in"

### 3. Dashboard
- You'll be redirected to `/dashboard`
- See your profile information
- Click "Logout" to sign out

## 🔧 Troubleshooting

### CORS Error?
Make sure CORS is enabled in backend `app.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

### Connection Refused?
- Check if backend is running on port 3000
- Check if MongoDB is running
- Verify .env configuration

### Token Issues?
- Clear browser localStorage
- Check backend JWT secrets
- Restart both servers

## 📚 Documentation

- **Frontend README**: `frontend/README.md`
- **Frontend Setup**: `frontend/SETUP.md`
- **Architecture**: `frontend/ARCHITECTURE.md`
- **Project Summary**: `frontend/PROJECT_SUMMARY.md`

## 🎯 What's Implemented

### ✅ Frontend
- Login & Register pages
- Dashboard
- JWT authentication
- Token refresh
- Protected routes
- Form validation
- Redux Toolkit state management
- React Hook Form
- Tailwind CSS styling

### ✅ Backend Integration
- API calls to backend
- CORS handling
- Token management
- Error handling

## 🚀 Next Steps

1. Explore the dashboard
2. Check Redux DevTools (browser extension)
3. Inspect Network tab for API calls
4. Try logout and login again
5. Test token refresh (wait for token expiry)

## 📞 Need Help?

Check the detailed documentation:
- `frontend/SETUP.md` - Detailed setup guide
- `frontend/ARCHITECTURE.md` - Architecture explanation
- `frontend/PROJECT_SUMMARY.md` - Complete feature list

## 🎉 You're All Set!

Both backend and frontend are running. Start building amazing features! 🚀

---

**Backend**: http://localhost:3000
**Frontend**: http://localhost:5173
