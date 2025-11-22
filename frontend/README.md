# HealthPulse Frontend

Modern healthcare management system frontend built with React, TypeScript, and Redux Toolkit.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📁 Project Structure

```
src/
├── core/
│   ├── domain/              # Entities & interfaces
│   ├── application/         # Redux stores & use cases
│   └── infrastructure/      # API & storage services
├── presentation/
│   ├── components/          # UI components (atoms, molecules, organisms)
│   ├── layouts/             # Layout components
│   ├── pages/               # Page components
│   └── hooks/               # Custom hooks
├── shared/
│   ├── constants/           # App constants
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
└── config/                  # App configuration
```

## 🛠️ Setup

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=HealthPulse
```

## 🎯 Features

### Implemented
- ✅ User Authentication (Login/Register)
- ✅ JWT Token Management with Auto-refresh
- ✅ Redux Toolkit State Management
- ✅ React Hook Form with Zod Validation
- ✅ Protected Routes
- ✅ Responsive Design
- ✅ CORS Proxy Configuration

### Coming Soon
- 🔄 Patient Management
- 🔄 Appointment Scheduling
- 🔄 Consultations
- 🔄 Prescriptions
- 🔄 Lab Orders
- 🔄 Document Management

## 🔐 Authentication Flow

1. User submits login/register form
2. Form validated with Zod schema
3. Redux Toolkit async thunk calls API
4. Tokens stored in localStorage
5. Axios interceptor adds token to requests
6. Auto-refresh on 401 errors
7. Redirect to dashboard on success

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🔗 API Integration

The frontend connects to the HealthPulse backend API:
- Backend Repository: https://github.com/kardasch404/HealthPulse
- API Base URL: `http://localhost:3000/api/v1`

### CORS Configuration

The Vite dev server is configured with a proxy to handle CORS:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 🎨 Component Architecture

### Atomic Design Pattern

- **Atoms**: Basic building blocks (Button, Input, Card)
- **Molecules**: Simple component groups (FormField, SearchBar)
- **Organisms**: Complex components (DataTable, Sidebar)

### Best Practices

- Uncontrolled forms with React Hook Form
- Zod schema validation
- Redux Toolkit for global state
- React Query for server state
- Custom hooks for reusable logic
- TypeScript for type safety

## 📚 Key Concepts

### Redux Toolkit
- `configureStore` - Store configuration
- `createSlice` - Reducer + actions
- `createAsyncThunk` - Async operations
- Typed hooks (`useAppDispatch`, `useAppSelector`)

### React Hook Form
- Uncontrolled components
- Zod resolver for validation
- Minimal re-renders
- Easy error handling

### State Management
- **Global State**: Redux Toolkit (auth, UI)
- **Server State**: React Query (API data)
- **Local State**: useState, useReducer
- **Form State**: React Hook Form

## 🔒 Security

- JWT tokens in localStorage
- Automatic token refresh
- Protected routes
- CORS handling
- Input validation
- XSS protection

## 📖 Usage Examples

### Login

```typescript
const { login, isLoading, error } = useAuth();

const onSubmit = async (data: LoginFormData) => {
  await login(data);
};
```

### Protected Route

```typescript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

### API Call

```typescript
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123',
});
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License

## 👥 Authors

HealthPulse Team

---

Made with ❤️ using React + TypeScript + Redux Toolkit
