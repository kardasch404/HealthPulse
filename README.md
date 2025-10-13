# HealthPulse

## Architecture

### Project Structure
```
HealthPulse/
├── app/                    # Application core
│   ├── config/            # Database and app configuration
│   ├── controllers/       # Request handlers
│   ├── database/          # Database setup and seeders
│   ├── middlewares/       # Authentication and error handling
│   ├── models/            # Data models
│   ├── repositories/      # Data access layer
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── tests/             # Test files
│   ├── utils/            # Utility functions (JWT, etc.)
│   ├── validators/        # Input validation
│   └── views/             # Jade templates
├── bin/                   # Server startup scripts
├── Docker/                # Containerization
├── public/                # Static assets
└── app.js                 # Express application entry point
```

### Technology Stack
- **Backend**: Node.js with Express.js framework
- **View Engine**: Jade templating
- **Architecture Pattern**: MVC with Repository pattern
- **Containerization**: Docker support
- **Authentication**: JWT-based

### Detailed Directory Structure

#### `/app` - Application Core
- **config/**
  - `db.js` - Database configuration and connection settings
- **controllers/**
  - Application controllers implementing request handling logic
- **database/**
  - `seed.js` - Database seeding script
  - `factories/` - Factory patterns for test data generation
  - `seeders/` - Seed data for database population
- **logs/**
  - `app.log` - Application logs
  - `error.log` - Error logs
- **middlewares/**
  - `auth.js` - Authentication middleware
  - `errorHandler.js` - Global error handling middleware
- **models/**
  - Data models and schema definitions
- **repositories/**
  - Data access layer implementation
- **routes/**
  - `index.js` - Main routing setup
  - `users.js` - User-related routes
- **services/**
  - Business logic implementation
- **utils/**
  - `hash.js` - Password hashing utilities
  - `jwt.js` - JWT token management
- **validators/**
  - Request validation middleware
- **views/**
  - `error.jade` - Error page template
  - `index.jade` - Home page template
  - `layout.jade` - Base layout template

#### `/bin`
- `www` - Server initialization script (Node.js entry point)

#### `/Docker`
- `docker-compose.yml` - Docker services configuration
- `Dockerfile` - Node.js application container configuration
- `dockerignore` - Docker build exclusions

#### `/public`
- **images/** - Static image assets
- **javascripts/** - Client-side JavaScript files
- **stylesheets/**
  - `style.css` - Global CSS styles

#### `/scripts`
- `migrate.js` - Database migration script
- `seed.js` - Database seeding script

#### `/swagger`
- API documentation and OpenAPI specifications

### Key Components
- **Routes**: Define API endpoints and HTTP method handlers
- **Controllers**: Handle request/response cycle and delegate to services
- **Services**: Implement core business logic and orchestrate data operations
- **Repositories**: Abstract database operations and data access patterns
- **Middlewares**: Provide authentication, error handling, and request processing
- **Models**: Define data structures and database schemas
- **Validators**: Ensure data integrity through request validation

### Technology Stack
- **Backend**: Node.js with Express.js framework
- **View Engine**: Jade templating
- **Architecture Pattern**: MVC with Repository pattern
- **Containerization**: Docker support
- **Authentication**: JWT-based

### Key Components
- **Routes**: API endpoint definitions
- **Controllers**: Request/response handling
- **Services**: Business logic implementation
- **Repositories**: Data access abstraction
- **Middlewares**: Authentication and error handling
- **Models**: Data structure definitions
- **Validators**: Input validation logic