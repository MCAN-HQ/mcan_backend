# MCAN Backend API

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)
- [Support](#support)

## 🎯 Overview

The MCAN (Muslim Corpers Association of Nigeria) Backend API is a comprehensive RESTful API built with Node.js, Express, and TypeScript. It serves as the backend infrastructure for the MCAN National Website, providing essential services for member management, property tracking, payment processing, marketplace functionality, and administrative operations.

### Key Objectives
- **Member Management**: Complete lifecycle management of NYSC corpers who are members of MCAN
- **Property Management**: Tracking and management of MCAN properties across different states
- **Payment Processing**: Secure payment handling for membership dues and marketplace transactions
- **Digital Identity**: E-ID card generation and management for members
- **Marketplace**: E-commerce functionality for MCAN members to buy and sell items
- **Administrative Tools**: Comprehensive admin panel for state and national administrators

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC) with multiple user roles
- Password hashing with bcrypt
- Email verification and password reset functionality
- Session management with Redis caching

### 👥 User Management
- Member registration with NYSC details
- Profile management with biometric data support
- State-based user organization
- Member status tracking (Active, Inactive, Suspended, Expired)

### 🏢 Property Management
- Comprehensive property tracking across all states
- Property types: Lodges, Buses, Mosques, Halls, Schools, etc.
- State-bound property management for administrators
- File upload support for property documentation
- Property condition and status tracking

### 💳 Payment Processing
- Integration with Flutterwave payment gateway
- Multiple payment methods (Bank Transfer, Card, USSD, Allowance Deduction)
- Payment verification and webhook handling
- Transaction history and reporting
- Membership dues management

### 🛒 Marketplace
- Product catalog with categories (Food, Books, Clothing, Electronics, etc.)
- Product management for sellers
- Order processing and tracking
- Inventory management
- State-based marketplace filtering

### 🆔 Digital Identity (E-ID)
- QR code-based E-ID card generation
- Member verification system
- Digital card management
- Biometric data integration

### 📊 Dashboard & Analytics
- Real-time statistics and metrics
- State-wise member distribution
- Payment analytics
- Property utilization reports
- Membership growth tracking

### 🔧 Administrative Features
- Multi-level admin hierarchy (Super Admin, National Admin, State Admin)
- State-bound administrative access
- User role management
- System configuration
- Audit logging

## 🛠 Tech Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Knex.js ORM
- **Cache**: Redis
- **Authentication**: JWT (jsonwebtoken)

### Additional Libraries
- **Validation**: Joi, express-validator
- **Security**: Helmet, bcryptjs, express-rate-limit
- **File Upload**: Multer, Sharp (image processing)
- **Cloud Storage**: Cloudinary
- **Payment**: Flutterwave integration
- **Email**: Nodemailer
- **SMS**: Twilio
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Testing**: Jest, Supertest

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MCAN-HQ/mcan_backend.git
   cd mcan_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration values
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb mcan_db
   
   # Run migrations
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

6. **Build and start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcan_db
DB_USER=mcan_user
DB_PASSWORD=your_secure_password
DB_SSL=false

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@mcan.org.ng
FROM_NAME=MCAN

# Payment Gateway (Flutterwave)
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# API Documentation
API_DOCS_ENABLED=true
```

## 📚 API Documentation

### Interactive Documentation
The API includes comprehensive Swagger/OpenAPI documentation accessible at:
- **Development**: `http://localhost:5000/api-docs`
- **Production**: `https://your-domain.com/api-docs`

### Health Check
Monitor API status at:
- `GET /health` - Basic health check
- `GET /test` - Simple test endpoint

## 🔐 Authentication

### Getting Started with Authentication

1. **Register a new user**
   ```bash
   POST /api/v1/auth/register
   Content-Type: application/json
   
   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "phone": "+2348123456789",
     "password": "securePassword123",
     "confirmPassword": "securePassword123",
     "stateCode": "LA",
     "nyscNumber": "LA/2024/123456",
     "deploymentState": "Lagos",
     "serviceYear": "2024"
   }
   ```

2. **Login**
   ```bash
   POST /api/v1/auth/login
   Content-Type: application/json
   
   {
     "email": "john@example.com",
     "password": "securePassword123"
   }
   ```

3. **Use the JWT token in subsequent requests**
   ```bash
   Authorization: Bearer <your-jwt-token>
   ```

### User Roles

The system supports the following user roles with hierarchical permissions:

1. **SUPER_ADMIN**: Full system access
2. **NATIONAL_ADMIN**: National-level administrative access
3. **STATE_AMEER**: State-level leadership access
4. **STATE_SECRETARY**: State-level administrative access
5. **MEMBER**: Regular member access

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | User login | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password` | Reset password | No |
| POST | `/api/v1/auth/verify-email` | Verify email address | No |
| GET | `/api/v1/auth/test-db` | Test database connection | No |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/v1/users` | Get all users | Yes | SUPER_ADMIN, NATIONAL_ADMIN |
| GET | `/api/v1/users/:id` | Get user by ID | Yes | All |
| PUT | `/api/v1/users/:id` | Update user | Yes | All (own profile) |
| DELETE | `/api/v1/users/:id` | Delete user | Yes | SUPER_ADMIN, NATIONAL_ADMIN |
| POST | `/api/v1/users/:id/change-role` | Change user role | Yes | SUPER_ADMIN, NATIONAL_ADMIN |

### Member Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/members` | Get all members | Yes |
| GET | `/api/v1/members/:id` | Get member by ID | Yes |
| POST | `/api/v1/members` | Create new member | Yes |
| PUT | `/api/v1/members/:id` | Update member | Yes |
| GET | `/api/v1/members/:id/payments` | Get member payments | Yes |
| PUT | `/api/v1/members/:id/status` | Update membership status | Yes |

### Property Management Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/v1/properties` | Get all properties | Yes | All |
| GET | `/api/v1/properties/:id` | Get property by ID | Yes | All |
| POST | `/api/v1/properties` | Create property | Yes | SUPER_ADMIN, NATIONAL_ADMIN, STATE_AMEER, STATE_SECRETARY |
| PUT | `/api/v1/properties/:id` | Update property | Yes | SUPER_ADMIN, NATIONAL_ADMIN, STATE_AMEER, STATE_SECRETARY |
| DELETE | `/api/v1/properties/:id` | Delete property | Yes | SUPER_ADMIN, NATIONAL_ADMIN |
| POST | `/api/v1/properties/:id/files` | Upload property files | Yes | SUPER_ADMIN, NATIONAL_ADMIN, STATE_AMEER, STATE_SECRETARY |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/payments` | Get all payments | Yes |
| GET | `/api/v1/payments/:id` | Get payment by ID | Yes |
| POST | `/api/v1/payments/initialize` | Initialize payment | Yes |
| POST | `/api/v1/payments/verify` | Verify payment | Yes |
| POST | `/api/v1/payments/webhook` | Payment webhook | No |
| GET | `/api/v1/payments/member/:memberId` | Get member payments | Yes |

### Marketplace Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/marketplace/products` | Get all products | Yes |
| GET | `/api/v1/marketplace/products/:id` | Get product by ID | Yes |
| POST | `/api/v1/marketplace/products` | Create product | Yes |
| PUT | `/api/v1/marketplace/products/:id` | Update product | Yes |
| DELETE | `/api/v1/marketplace/products/:id` | Delete product | Yes |
| POST | `/api/v1/marketplace/orders` | Create order | Yes |
| GET | `/api/v1/marketplace/orders` | Get user orders | Yes |

### E-ID Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/eid/me` | Get user's E-ID | Yes |
| POST | `/api/v1/eid/me` | Generate/regenerate E-ID | Yes |
| GET | `/api/v1/eid/verify/:qrCode` | Verify E-ID QR code | Yes |

### Dashboard Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/v1/dashboard/stats` | Get dashboard statistics | Yes | All |
| GET | `/api/v1/dashboard/members` | Get member statistics | Yes | All |
| GET | `/api/v1/dashboard/payments` | Get payment statistics | Yes | All |
| GET | `/api/v1/dashboard/properties` | Get property statistics | Yes | All |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/v1/admin/users` | Get all users (admin view) | Yes | SUPER_ADMIN, NATIONAL_ADMIN |
| POST | `/api/v1/admin/users` | Create user (admin) | Yes | SUPER_ADMIN, NATIONAL_ADMIN |
| PUT | `/api/v1/admin/users/:id` | Update user (admin) | Yes | SUPER_ADMIN, NATIONAL_ADMIN |
| GET | `/api/v1/admin/audit-logs` | Get audit logs | Yes | SUPER_ADMIN, NATIONAL_ADMIN |
| GET | `/api/v1/admin/system-config` | Get system configuration | Yes | SUPER_ADMIN |

### Utility Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/contact` | Submit contact form | No |
| POST | `/api/v1/create-super-admin` | Create super admin (development) | No |
| GET | `/health` | Health check | No |
| GET | `/test` | Test endpoint | No |

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
  state_code VARCHAR(10),
  nysc_number VARCHAR(20),
  deployment_state VARCHAR(100),
  service_year VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  profile_picture VARCHAR(500),
  biometric_data JSONB,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Members Table
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state_code VARCHAR(10) NOT NULL,
  nysc_number VARCHAR(20) UNIQUE NOT NULL,
  deployment_state VARCHAR(100) NOT NULL,
  service_year VARCHAR(10) NOT NULL,
  registration_date TIMESTAMP DEFAULT NOW(),
  membership_status VARCHAR(20) DEFAULT 'ACTIVE',
  payment_status VARCHAR(20) DEFAULT 'CURRENT',
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Properties Table
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'OTHER',
  state VARCHAR(100) NOT NULL,
  location VARCHAR(500) NOT NULL,
  capacity INTEGER,
  condition VARCHAR(50),
  manager VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  ownership VARCHAR(50) NOT NULL DEFAULT 'MCAN',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  transaction_reference VARCHAR(255),
  flutterwave_reference VARCHAR(255),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export PORT=5000
   # ... other production variables
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Environment-specific Configurations

#### Development
- API Documentation enabled
- Detailed logging
- Hot reload with nodemon

#### Production
- Optimized builds
- Error tracking with Sentry
- Health monitoring
- Rate limiting enabled

## 🛠 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Database
npm run migrate      # Run database migrations
npm run migrate:rollback  # Rollback migrations
npm run seed         # Seed database with initial data

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
```

### Project Structure

```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models (if using ORM)
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── migrations/          # Database migrations
├── seeds/               # Database seeds
├── logs/                # Application logs
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── knexfile.ts
└── README.md
```

### Adding New Features

1. **Create route file** in `src/routes/`
2. **Create controller** in `src/controllers/`
3. **Create service** in `src/services/` (if needed)
4. **Add validation** in `src/utils/validation.ts`
5. **Create migration** for database changes
6. **Add tests** for new functionality
7. **Update API documentation**

### Code Style Guidelines

- Use TypeScript strict mode
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write unit tests for new features
- Use async/await instead of promises

## 🤝 Contributing

We welcome contributions to the MCAN Backend API! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Pull Request Guidelines
- Provide a clear description of changes
- Include tests for new functionality
- Update documentation as needed
- Ensure code follows project style guidelines
- Request review from maintainers

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include environment information
- Add relevant logs or error messages

## 📞 Support

### Technical Support
- **Email**: tech@mcan.org.ng
- **GitHub Issues**: [Create an issue](https://github.com/MCAN-HQ/mcan_backend/issues)
- **Documentation**: [API Docs](http://localhost:5000/api-docs)

### Community
- **Website**: [MCAN Official Website](https://mcan.org.ng)
- **Discord**: MCAN Technical Community
- **Telegram**: MCAN Developers Group

### Emergency Support
For critical issues affecting production:
- Email: emergency@mcan.org.ng
- Phone: +234-XXX-XXXX-XXX

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MCAN Technical Team** - Core development team
- **NYSC Integration** - Nigerian Youth Service Corps
- **Flutterwave** - Payment gateway integration
- **Cloudinary** - File storage and image processing
- **Open Source Community** - Various libraries and tools used

---

**Made with ❤️ for the Muslim Corpers Association of Nigeria**

*For more information about MCAN, visit [mcan.org.ng](https://mcan.org.ng)*
