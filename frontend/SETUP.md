# HealthPulse Frontend - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env and set your backend URL
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Backend Setup

Make sure your backend is running on `http://localhost:3000`

### Enable CORS in Backend

Add this to your backend `app.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

## 📝 Testing the Application

### 1. Register a New User
- Navigate to `http://localhost:5173/register`
- Fill in the form:
  - First Name: John
  - Last Name: Doe
  - Email: john.doe@example.com
  - Phone: +1234567890 (optional)
  - Role: Select a role (e.g., Patient, Doctor)
  - Password: password123
  - Confirm Password: password123
- Click "Create Account"

### 2. Login
- Navigate to `http://localhost:5173/login`
- Enter credentials:
  - Email: john.doe@example.com
  - Password: password123
- Click "Sign in"

### 3. Dashboard
- After successful login, you'll be redirected to `/dashboard`
- You can see your profile information
- Click "Logout" to sign out

## 🏗️ Architecture Overview

### State Management
- **Redux Toolkit**: Global state (authentication, user)
- **React Query**: Server state (API data caching)
- **React Hook Form**: Form state (uncontrolled)
- **localStorage**: Token persistence

### Authentication Flow
```
1. User submits form
   ↓
2. Zod validates input
   ↓
3. Redux async thunk calls API
   ↓
4. Tokens saved to localStorage
   ↓
5. User redirected to dashboard
   ↓
6. Axios interceptor adds token to requests
   ↓
7. Auto-refresh on 401 errors
```

### Folder Structure Explained

```
src/
├── core/                    # Business logic layer
│   ├── domain/             # Entities & interfaces (DDD)
│   ├── application/        # Redux stores & use cases
│   └── infrastructure/     # External services (API, storage)
│
├── presentation/           # UI layer
│   ├── components/        # Reusable UI components
│   │   ├── atoms/        # Basic elements (Button, Input)
│   │   ├── molecules/    # Simple combinations
│   │   └── organisms/    # Complex components
│   ├── pages/            # Route pages
│   ├── layouts/          # Layout wrappers
│   └── hooks/            # Custom React hooks
│
├── shared/                # Shared utilities
│   ├── constants/        # App constants
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
│
└── config/               # App configuration
    ├── env.ts           # Environment variables
    └── routes.tsx       # Route definitions
```

## 🎯 Key Features Implemented

### ✅ Authentication
- Login with email/password
- Register new users
- JWT token management
- Auto token refresh
- Logout functionality

### ✅ Form Handling
- React Hook Form (uncontrolled)
- Zod schema validation
- Real-time error messages
- Type-safe forms

### ✅ State Management
- Redux Toolkit slices
- Async thunks for API calls
- Typed hooks (useAppDispatch, useAppSelector)
- Persistent state (localStorage)

### ✅ Routing
- React Router v6
- Protected routes
- Auto-redirect on auth
- 404 handling

### ✅ API Integration
- Axios instance with interceptors
- Auto token injection
- Token refresh on 401
- Error handling
- CORS proxy

## 🔐 Security Features

- JWT tokens in localStorage
- Automatic token refresh
- Protected routes
- Input validation (Zod)
- XSS protection
- CORS handling

## 📚 Best Practices Used

### React
- Functional components
- Custom hooks for logic reuse
- Proper prop typing
- Component composition

### TypeScript
- Strict mode enabled
- Interface definitions
- Type inference
- Generic types

### Redux Toolkit
- createSlice for reducers
- createAsyncThunk for async
- Typed hooks
- Immer for immutability

### Forms
- Uncontrolled components
- Schema validation
- Error handling
- Accessibility

## 🛠️ Development Tips

### Hot Reload
Vite provides instant HMR. Changes reflect immediately.

### TypeScript Errors
```bash
# Check types
npm run build
```

### Debugging Redux
Install Redux DevTools extension in your browser.

### API Debugging
Check Network tab in browser DevTools.

## 📦 Build for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend has CORS enabled
- Check Vite proxy configuration
- Verify API_BASE_URL in .env

### Token Issues
- Clear localStorage
- Check token expiration
- Verify backend JWT secret

### Build Errors
- Delete node_modules and reinstall
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors

## 📖 Next Steps

### Implement More Features
1. Patient Management
2. Appointment Scheduling
3. Consultations
4. Prescriptions
5. Lab Orders
6. Document Upload

### Enhance UI
1. Add loading skeletons
2. Implement toast notifications
3. Add data tables
4. Create charts/graphs
5. Improve mobile responsiveness

### Optimize Performance
1. Code splitting
2. Lazy loading routes
3. Image optimization
4. Bundle analysis

## 🤝 Contributing

1. Create feature branch
2. Follow existing patterns
3. Write TypeScript
4. Test thoroughly
5. Submit PR

## 📞 Support

For issues or questions:
- Check backend logs
- Review browser console
- Check Network tab
- Verify environment variables

---

Happy coding! 🎉
