# HealthPulse Frontend Architecture

## 🏛️ Architecture Pattern: Clean Architecture + Atomic Design

### Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components, Pages, Hooks)       │
├─────────────────────────────────────────┤
│         Application Layer               │
│  (Redux Stores, Use Cases, Business)    │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│  (API Services, Storage, External)      │
├─────────────────────────────────────────┤
│         Domain Layer                    │
│  (Entities, Interfaces, Types)          │
└─────────────────────────────────────────┘
```

## 📁 Detailed Structure

### Core Layer (Business Logic)

#### Domain
- **Entities**: Business objects (User, Patient, Appointment)
- **Interfaces**: Contracts for services
- Pure TypeScript, no framework dependencies

#### Application
- **Stores**: Redux Toolkit slices
- **Use Cases**: Business logic operations
- Orchestrates domain and infrastructure

#### Infrastructure
- **API Services**: HTTP calls with Axios
- **Storage**: localStorage wrapper
- External dependencies

### Presentation Layer (UI)

#### Components (Atomic Design)
```
Atoms (Basic)
  ├── Button
  ├── Input
  └── Card

Molecules (Simple Combinations)
  ├── FormField
  ├── SearchBar
  └── Alert

Organisms (Complex)
  ├── DataTable
  ├── Sidebar
  └── ProtectedRoute
```

#### Pages
- Route-level components
- Compose organisms
- Handle page-specific logic

#### Hooks
- Custom React hooks
- Reusable logic
- State management

#### Layouts
- Page wrappers
- Common structure
- Navigation

### Shared Layer

- **Constants**: App-wide constants
- **Types**: TypeScript definitions
- **Utils**: Helper functions

## 🔄 Data Flow

### Authentication Flow
```
LoginPage
  ↓ (form submit)
useAuth hook
  ↓ (dispatch)
Redux Async Thunk
  ↓ (API call)
authService
  ↓ (HTTP)
Axios Instance
  ↓ (interceptor)
Backend API
  ↓ (response)
localStorage
  ↓ (tokens saved)
Redux State Updated
  ↓ (navigate)
Dashboard
```

### API Request Flow
```
Component
  ↓
Custom Hook / Redux Thunk
  ↓
Service Layer
  ↓
Axios Instance
  ├── Request Interceptor (add token)
  ├── HTTP Request
  └── Response Interceptor (refresh token)
  ↓
Backend API
  ↓
Response
  ↓
State Update (Redux/React Query)
  ↓
Component Re-render
```

## 🎯 Design Patterns

### 1. Repository Pattern
```typescript
// Service acts as repository
export const authService = {
  login: async (credentials) => { /* ... */ },
  register: async (data) => { /* ... */ },
};
```

### 2. Singleton Pattern
```typescript
// Axios instance (single instance)
export const axiosInstance = axios.create({ /* ... */ });
```

### 3. Observer Pattern
```typescript
// Redux store (observers subscribe)
const { user } = useAppSelector(state => state.auth);
```

### 4. Factory Pattern
```typescript
// Redux Toolkit createSlice
export const authSlice = createSlice({ /* ... */ });
```

### 5. Strategy Pattern
```typescript
// Different validation strategies
export const loginSchema = z.object({ /* ... */ });
export const registerSchema = z.object({ /* ... */ });
```

## 🔐 State Management Strategy

### Global State (Redux Toolkit)
- Authentication state
- User information
- UI state (modals, theme)

### Server State (React Query)
- API data caching
- Background refetching
- Optimistic updates

### Local State (useState)
- Component-specific state
- UI interactions
- Temporary data

### Form State (React Hook Form)
- Form inputs
- Validation
- Submission

## 🚀 Performance Optimizations

### Code Splitting
```typescript
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
```

### Memoization
```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

### React Query Caching
```typescript
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## 🧪 Testing Strategy

### Unit Tests
- Components (atoms, molecules)
- Utilities
- Hooks

### Integration Tests
- Page components
- API services
- Redux slices

### E2E Tests
- User flows
- Authentication
- Critical paths

## 🔒 Security Measures

### Input Validation
```typescript
// Zod schema validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

### Token Management
```typescript
// Secure storage
storageService.setTokens(accessToken, refreshToken);

// Auto refresh
axiosInstance.interceptors.response.use(/* refresh logic */);
```

### Protected Routes
```typescript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## 📊 State Shape

```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  }
}
```

## 🔄 Component Lifecycle

```
Mount
  ↓
useEffect (fetch data)
  ↓
Loading State
  ↓
Data Received
  ↓
Render
  ↓
User Interaction
  ↓
State Update
  ↓
Re-render
  ↓
Unmount (cleanup)
```

## 🎨 Styling Strategy

### Tailwind CSS
- Utility-first approach
- Responsive design
- Custom theme

### Component Styles
```typescript
const baseStyles = 'flex items-center justify-center';
const variants = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-200 text-gray-900',
};
```

## 📱 Responsive Design

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Mobile-First
```typescript
className="w-full md:w-1/2 lg:w-1/3"
```

## 🔧 Development Workflow

1. Create feature branch
2. Implement in layers (domain → infrastructure → application → presentation)
3. Write tests
4. Code review
5. Merge to dev
6. Deploy to staging
7. Test
8. Merge to main
9. Deploy to production

## 📚 Best Practices

### TypeScript
- Use strict mode
- Define interfaces
- Avoid `any`
- Use generics

### React
- Functional components
- Custom hooks
- Proper key props
- Avoid prop drilling

### Redux
- Normalize state
- Use selectors
- Async thunks
- Immer for updates

### Forms
- Uncontrolled inputs
- Schema validation
- Error handling
- Accessibility

## 🎯 Future Enhancements

1. Implement RTK Query
2. Add Suspense boundaries
3. Implement error boundaries
4. Add service workers (PWA)
5. Implement WebSocket
6. Add i18n support
7. Implement dark mode
8. Add analytics

---

This architecture ensures:
- ✅ Scalability
- ✅ Maintainability
- ✅ Testability
- ✅ Performance
- ✅ Security
- ✅ Developer Experience
