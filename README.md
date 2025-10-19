# HealthPulse

Medical management system built with Node.js, Express.js, and MongoDB.

## Project Structure

```
HealthPulse/
├── app/
│   ├── abstractions/          # Base classes
│   │   ├── BaseController.js
│   │   └── BaseServise.js
│   ├── config/                # Configuration files
│   │   ├── db.js             # MongoDB connection (Singleton)
│   │   └── email.js          # Email configuration
│   ├── constants/             # Application constants
│   │   ├── roles.js          # Role & permission definitions
│   │   └── statusCodes.js    # HTTP & status codes
│   ├── controllers/           # Request handlers
│   │   ├── AuthController.js
│   │   ├── PatientController.js
│   │   ├── TerminController.js
│   │   └── UserController.js
│   ├── database/              # Database utilities
│   │   └── seed.js           # Database seeder
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── permission.js
│   │   ├── requestLogger.js
│   │   └── validation.js
│   ├── models/                # Mongoose models
│   │   ├── Patient.js
│   │   ├── Role.js
│   │   ├── Termin.js
│   │   └── User.js
│   ├── queue/                 # Background jobs
│   │   └── emailQueue.js     # Email queue with Bull
│   ├── repositories/          # Data access layer
│   ├── routes/                # API routes
│   │   ├── v1/
│   │   │   ├── auth.routes.js
│   │   │   ├── index.js
│   │   │   └── users.js
│   │   └── index.js
│   ├── security/              # Security utilities
│   │   ├── encryption.js
│   │   ├── permissions.js
│   │   └── secrets.js
│   ├── services/              # Business logic
│   │   ├── AppointmentService.js
│   │   ├── AuthService.js
│   │   ├── EmailService.js
│   │   └── PatientService.js
│   ├── tests/                 # Test files
│   │   ├── e2e/
│   │   ├── integration/
│   │   └── unit/
│   ├── utils/                 # Utility functions
│   │   ├── crypto.js
│   │   ├── jwt.js
│   │   └── validators.js
│   └── validators/            # Input validation
│       ├── AuthValidator.js
│       ├── PatientValidator.js
│       ├── TerminSchema.js
│       ├── UserValidator.js
│       └── ValidationSchema.js
├── bin/
│   └── www.js                 # Server entry point
├── Docker/
│   ├── .dockerignore
│   ├── docker-compose.yml
│   └── Dockerfile
├── scripts/
│   └── seed.js               # Seed script runner
├── tests/                     # Root test directory
├── .env                       # Environment variables (not in git)
├── .env.example              # Environment template
├── .gitignore
├── app.js                    # Express app configuration
├── docker-compose.yml
├── Dockerfile
├── medical.drawio            # Database diagram
├── package.json
└── README.md
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Validation**: Joi
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer
- **Queue**: Bull + Redis
- **Containerization**: Docker

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start MongoDB and Redis
5. Seed the database:
   ```bash
   npm run seed
   ```
6. Run the application:
   ```bash
   npm start
   ```

## Architecture

- **MVC Pattern**: Models, Views, Controllers separation
- **Singleton Pattern**: Database connection
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic isolation
- **Middleware Pipeline**: Request processing
- **Queue System**: Background job processing

## Environment Variables

See `.env.example` for required configuration.
