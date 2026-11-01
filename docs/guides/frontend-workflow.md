# HealthPulse Frontend - Workflow & Concepts

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [State Management](#state-management)
- [React Concepts](#react-concepts)
- [Form Management](#form-management)
- [Data Fetching](#data-fetching)
- [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

### Clean Architecture Principles

Our frontend follows **Clean Architecture** with clear separation of concerns:

```
src/
├── core/                      # Business Logic Layer
│   ├── domain/               # Enterprise Business Rules
│   │   ├── entities/        # User.ts, Patient.ts, Appointment.ts
│   │   └── interfaces/      # IAuthService.ts, IUserRepository.ts
│   ├── application/         # Application Business Rules
│   │   ├── stores/         # Redux Toolkit stores (authStore.ts, uiStore.ts)
│   │   └── use-cases/      # Business use cases (loginUseCase.ts)
│   └── infrastructure/      # External Interfaces
│       ├── api/            # API clients (axiosInstance.ts, services/)
│       └── storage/        # localStorage.ts, sessionStorage.ts
├── presentation/            # UI Layer
│   ├── components/         # Atomic Design Pattern
│   │   ├── atoms/         # Button, Input, Badge, Label
│   │   ├── molecules/     # FormField, SearchBar, Card
│   │   └── organisms/     # DataTable, Sidebar, Header
│   ├── layouts/           # Page layouts
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── pages/             # Route pages
│   │   ├── auth/         # Login, Register
│   │   ├── admin/        # UserManagement, RoleManagement
│   │   ├── doctor/       # DoctorDashboard, Consultations
│   │   ├── patient/      # PatientDashboard, Appointments
│   │   ├── pharmacist/   # Prescriptions
│   │   └── lab-tech/     # LabOrders
│   └── hooks/            # Custom React hooks
│       ├── useAuth.ts
│       ├── useDebounce.ts
│       └── usePermissions.ts
├── shared/               # Shared utilities
│   ├── constants/       # API_URLS, ROLES, STATUS_CODES
│   ├── types/          # TypeScript definitions
│   └── utils/          # formatters.ts, validators.ts
└── config/             # Configuration
    ├── env.ts
    └── routes.tsx
```

---

## 🔄 State Management

### Context API vs Redux Toolkit

#### When to use Context API
- **Simple, localized state** (theme, language)
- **Authentication state** (user info, token)
- **UI state** (sidebar open/close, modals)

```tsx
// Example: Auth Context
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### When to use Redux Toolkit
- **Complex, global state** (users list, roles, appointments)
- **State shared across many components**
- **Need for time-travel debugging**
- **Advanced middleware requirements**

### Redux Toolkit Setup

#### 1. Configure Store
```tsx
// core/application/stores/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import usersReducer from './usersSlice';
import rolesReducer from './rolesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    roles: rolesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 2. Create Slice
```tsx
// core/application/stores/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../infrastructure/api/services/userService';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  selectedUser: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAll();
      return response.data.data.users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserData, { rejectWithValue }) => {
    try {
      const response = await userService.create(userData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;
```

#### 3. Use in Components
```tsx
// presentation/pages/admin/UserManagement.tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchUsers, createUser } from '../../../core/application/stores/usersSlice';

export const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleCreateUser = async (userData: CreateUserData) => {
    await dispatch(createUser(userData));
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {users.map(user => <UserCard key={user._id} user={user} />)}
    </div>
  );
};
```

#### 4. Custom Hooks
```tsx
// presentation/hooks/redux.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../core/application/stores/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## ⚛️ React Concepts

### Essential Hooks

#### useState - Local State
```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

#### useEffect - Side Effects
```tsx
useEffect(() => {
  // Runs on mount and when dependencies change
  fetchData();
  
  return () => {
    // Cleanup function
    cancelRequest();
  };
}, [dependency]);
```

#### useReducer - Complex State Logic
```tsx
interface State {
  count: number;
  step: number;
}

type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      return state;
  }
};

const Counter = () => {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
};
```

#### useCallback - Memoize Functions
```tsx
const handleSearch = useCallback((query: string) => {
  // This function is only recreated when dependencies change
  searchUsers(query);
}, [searchUsers]);
```

#### useMemo - Memoize Values
```tsx
const filteredUsers = useMemo(() => {
  return users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [users, searchTerm]);
```

#### useRef - DOM References & Mutable Values
```tsx
const inputRef = useRef<HTMLInputElement>(null);
const renderCount = useRef(0);

useEffect(() => {
  renderCount.current += 1;
  inputRef.current?.focus();
});
```

### Custom Hooks Examples

#### useDebounce
```tsx
// presentation/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);

  return <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />;
};
```

#### useLocalStorage
```tsx
// presentation/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue] as const;
};
```

---

## 📝 Form Management

### React Hook Form

#### Basic Setup
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fname: z.string().min(2, 'First name required'),
  lname: z.string().min(2, 'Last name required'),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      password: '',
      fname: '',
      lname: '',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await userService.create(data);
      reset();
      alert('User created successfully!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
```

#### Controlled vs Uncontrolled Forms

**Uncontrolled (React Hook Form - Recommended)**
```tsx
// Better performance, less re-renders
const { register } = useForm();
<input {...register('email')} />
```

**Controlled (useState)**
```tsx
// More control, but more re-renders
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

---

## 🌐 Data Fetching

### React Query (TanStack Query)

#### Setup
```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

#### Usage
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const UserManagement = () => {
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userService.getAll();
      return response.data.data.users;
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (userData: CreateUserData) => userService.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('User created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create user');
    },
  });

  const handleCreate = (userData: CreateUserData) => {
    createMutation.mutate(userData);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.map(user => <UserCard key={user._id} user={user} />)}
    </div>
  );
};
```

### RTK Query (Redux Toolkit Query)

```tsx
// core/infrastructure/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users', 'Roles'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<User, CreateUserData>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { useGetUsersQuery, useCreateUserMutation } = apiSlice;
```

---

## ✅ Best Practices

### 1. Component Organization
```tsx
// ✅ Good: Single Responsibility
const UserCard = ({ user }: { user: User }) => (
  <div className="card">
    <h3>{user.fname} {user.lname}</h3>
    <p>{user.email}</p>
  </div>
);

// ❌ Bad: Too many responsibilities
const UserManagement = () => {
  // Fetching, filtering, sorting, rendering all in one component
};
```

### 2. Prop Drilling Solution
```tsx
// ❌ Bad: Prop drilling
<Parent>
  <Child user={user}>
    <GrandChild user={user}>
      <GreatGrandChild user={user} />
    </GrandChild>
  </Child>
</Parent>

// ✅ Good: Context API
const UserContext = createContext<User | null>(null);

<UserContext.Provider value={user}>
  <Parent>
    <Child>
      <GrandChild>
        <GreatGrandChild />
      </GrandChild>
    </Child>
  </Parent>
</UserContext.Provider>
```

### 3. Performance Optimization
```tsx
// Use React.memo for expensive components
export const UserCard = React.memo(({ user }: { user: User }) => {
  return <div>{user.name}</div>;
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Use useMemo for expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);
```

### 4. Error Boundaries
```tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### 5. TypeScript Best Practices
```tsx
// ✅ Good: Proper typing
interface User {
  _id: string;
  email: string;
  fname: string;
  lname: string;
  roleId: Role;
}

const UserCard = ({ user }: { user: User }) => { ... };

// ❌ Bad: Using any
const UserCard = ({ user }: { user: any }) => { ... };
```

---

## 📚 Learning Resources

- **Redux Toolkit**: https://redux-toolkit.js.org/
- **React Hook Form**: https://react-hook-form.com/
- **React Query**: https://tanstack.com/query/latest
- **Context API**: https://react.dev/reference/react/useContext
- **React Hooks**: https://react.dev/reference/react

---

## 🎯 Summary

| Concept | Use Case | Tool |
|---------|----------|------|
| Simple State | Theme, UI toggles | Context API |
| Complex State | Users, Roles, Global data | Redux Toolkit |
| Forms | User input, validation | React Hook Form + Zod |
| Data Fetching | API calls, caching | React Query / RTK Query |
| Performance | Expensive renders | useMemo, useCallback, React.memo |
| Side Effects | API calls, subscriptions | useEffect |
| Complex Logic | State machines | useReducer |

---

**Built with ❤️ for HealthPulse**
