# Document AI Backend - Source Code Documentation

## Overview
This is a NestJS-based backend application for document processing using AI. The application handles document uploads, processes them using AWS Textract, manages jobs, and provides authentication for users.

---

## 📁 Folder Structure

```
src/
├── modules/
│   ├── auth/           # Authentication & Authorization
│   ├── users/          # User Management
│   ├── upload/         # File Upload Handling
│   ├── jobs/           # Job Processing & Management
│   ├── textract/       # AWS Textract Integration
│   └── exports/        # Data Export Functionality
```

---

## 🔐 Auth Module (`src/modules/auth/`)

Handles user authentication and authorization using JWT tokens.

### Files:

#### `auth.controller.ts`
- **Purpose**: Exposes authentication endpoints
- **Endpoints**:
  - `POST /auth/register` - Register new users
  - `POST /auth/login` - Login existing users
- **Request Body**: `{ email: string, password: string }`

#### `auth.service.ts`
- **Purpose**: Core authentication logic
- **Key Functions**:
  - `register(email, password)` - Creates new user with hashed password using bcrypt
  - `login(email, password)` - Validates credentials and returns JWT token
  - `generateToken(userId, email)` - Creates JWT access token
- **Dependencies**: 
  - UsersService (for user CRUD)
  - JwtService (for token generation)
  - bcrypt (for password hashing)

#### `auth.module.ts`
- **Purpose**: Module configuration
- **Imports**: 
  - UsersModule
  - PassportModule
  - JwtModule (configured with JWT_SECRET and 1h expiration)
- **Providers**: AuthService, JwtStrategy
- **Controllers**: AuthController

---

## 👥 Users Module (`src/modules/users/`)

Manages user data and database operations.

### Files:

#### `user.entity.ts`
- **Purpose**: TypeORM entity defining user database schema
- **Fields**:
  - `id` (string, UUID, primary key)
  - `email` (string, unique)
  - `passwordHash` (string)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

#### `user.service.ts`
- **Purpose**: User database operations
- **Key Functions**:
  - `findByEmail(email)` - Find user by email
  - `findById(id)` - Find user by ID
  - `createUser(data)` - Create new user record
- **Uses**: TypeORM Repository pattern

#### `user.module.ts`
- **Purpose**: Module configuration
- **Exports**: UsersService (for use in other modules like Auth)

---

## 📤 Upload Module (`src/modules/upload/`)

Handles file uploads to AWS S3 using presigned URLs.

### Files:

#### `upload.controller.ts`
- **Purpose**: Exposes upload endpoints
- **Endpoints**:
  - `POST /upload/presigned-url` - Get presigned URL for authenticated users (requires JWT)
  - `POST /upload/guest-presigned-url` - Get presigned URL for guest users (no auth)
- **Request Body**: `{ fileName: string, contentType: string }`

#### `upload.service.ts`
- **Purpose**: Generate S3 presigned URLs
- **Key Functions**:
  - `getPresignedUrl(fileName, contentType)` - Creates presigned URL for S3 upload
- **Logic**:
  - Generates unique key: `uploads/{uuid}-{fileName}`
  - Creates presigned URL valid for 5 minutes (300 seconds)
  - Returns both URL and key for client-side upload

#### `upload.module.ts`
- **Purpose**: Module configuration
- **Standalone module** (no external dependencies)

---

## 💼 Jobs Module (`src/modules/jobs/`)

Manages document processing jobs with status tracking.

### Files:

#### `jobs.entity.ts`
- **Purpose**: TypeORM entity for job tracking
- **Fields**:
  - `id` (UUID, primary key)
  - `userId` (UUID, 'guest' for unauthenticated)
  - `inputFileKey` (S3 key of uploaded file)
  - `inputFileType` (file extension)
  - `documentType` ('EXPENSE' | 'HR')
  - `status` (PENDING, PROCESSING, COMPLETED, FAILED)
  - `outputFileKey` (S3 key of processed file)
  - `errorMessage` (error details if failed)
  - `createdAt`, `updatedAt` (timestamps)

#### `jobs.service.ts`
- **Purpose**: Job business logic
- **Key Functions**:
  - `createJob(params)` - Creates new job and sends to SQS queue
  - `getJobById(jobId, userId?)` - Retrieves job (with optional user validation)
  - `updateJobStatus(jobId, status, extra?)` - Updates job status and metadata
- **Integration**: Sends messages to SQS for async processing

#### `jobs.controller.ts`
- **Purpose**: Job management endpoints
- **Endpoints**:
  - `POST /jobs` - Create job (authenticated)
  - `POST /jobs/guest` - Create job (guest)
  - `GET /jobs/:id/status` - Get job status (authenticated)
  - `GET /jobs/guest/:id/status` - Get job status (guest)
  - `GET /jobs/:id/download` - Download processed file (authenticated)
  - `GET /jobs/guest/:id/download` - Download processed file (guest)
- **Features**:
  - Separate endpoints for authenticated and guest users
  - Returns presigned download URLs for completed jobs
  - Handles different job statuses (PENDING, PROCESSING, COMPLETED, FAILED)

#### `dto/create-job.dto.ts`
- **Purpose**: Data validation for job creation
- **Fields**:
  - `inputFileKey` (required string)
  - `documentType` (must be 'EXPENSE' or 'HR')
- **Uses**: class-validator decorators

#### `jobs.processor.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: Would handle async job processing (likely SQS consumer)

#### `jobs.module.ts`
- **Purpose**: Module configuration
- **Exports**: JobsService

---

## 🤖 Textract Module (`src/modules/textract/`)

AWS Textract integration for document parsing (AI-powered OCR and data extraction).

### Files:

#### `textract.services.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: AWS Textract API integration

#### `document.parser.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: Parse general document types

#### `expense.parser.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: Parse expense documents (receipts, invoices)

#### `textract.module.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: Module configuration for Textract services

**Note**: This module appears to be planned but not yet implemented. It would handle:
- Calling AWS Textract APIs
- Parsing expense documents (receipts, invoices)
- Parsing HR documents (resumes, forms)
- Extracting structured data from images/PDFs

---

## 📊 Exports Module (`src/modules/exports/`)

Data export functionality in various formats.

### Files:

#### `export.service.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: Orchestrate export operations

#### `csv.exporter.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: Export data to CSV format

#### `excel.exporter.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: Export data to Excel (.xlsx) format

#### `sheets.exporter.ts`
- **Status**: Empty/Not implemented
- **Intended Purpose**: Export data to Google Sheets

**Note**: This module is planned but not implemented. It would handle:
- Converting extracted document data to various formats
- CSV exports for simple data
- Excel exports for formatted spreadsheets
- Google Sheets integration for cloud-based collaboration

---

## 🔄 Application Flow

### 1. User Registration/Login
```
Client → POST /auth/register → AuthService → UsersService → Database
Client → POST /auth/login → AuthService → Returns JWT Token
```

### 2. File Upload (Authenticated User)
```
Client → POST /upload/presigned-url (with JWT) → UploadService
       → Returns presigned S3 URL
Client → PUT to S3 URL → Uploads file directly to S3
```

### 3. Job Creation & Processing
```
Client → POST /jobs (with inputFileKey) → JobsService
       → Creates job in database (status: PENDING)
       → Sends message to SQS queue
       → Returns jobId

[Background Processing]
SQS Consumer → Processes job → Textract API → Extracts data
            → Updates job status to PROCESSING → COMPLETED/FAILED
```

### 4. Job Status & Download
```
Client → GET /jobs/:id/status → Returns current status
Client → GET /jobs/:id/download → Returns presigned download URL (if COMPLETED)
```

### 5. Guest User Flow
```
Same as above but uses /guest endpoints (no authentication required)
userId is set to 'guest' in database
```

---

## 🔑 Key Technologies

- **Framework**: NestJS (Node.js framework)
- **Database**: TypeORM (SQL database ORM)
- **Authentication**: JWT (JSON Web Tokens) + Passport
- **Password Security**: bcrypt
- **Cloud Storage**: AWS S3 (presigned URLs)
- **Message Queue**: AWS SQS
- **AI/ML**: AWS Textract (planned)
- **Validation**: class-validator

---

## 🚀 Features

### Implemented:
✅ User registration and authentication  
✅ JWT-based authorization  
✅ File upload via S3 presigned URLs  
✅ Job creation and tracking  
✅ Guest user support (no registration required)  
✅ Job status monitoring  
✅ Secure file downloads  
✅ Async job processing via SQS  

### Planned (Not Yet Implemented):
⏳ AWS Textract integration  
⏳ Document parsing (expense & HR documents)  
⏳ Data export (CSV, Excel, Google Sheets)  
⏳ Background job processor  

---

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with 1-hour expiration
- Protected routes using JwtAuthGuard
- Presigned URLs with 5-minute expiration
- User-specific job access control
- Separate guest and authenticated user flows

---

## 📝 Notes

1. **Environment Variables Required**:
   - `JWT_SECRET` - Secret key for JWT signing
   - `S3_BUCKET` - AWS S3 bucket name
   - Database connection variables (TypeORM)
   - AWS credentials (for S3 and SQS)

2. **Guest Users**: The system supports both authenticated and guest users, with guest users having `userId = 'guest'` in the database.

3. **Job Processing**: Jobs are processed asynchronously using AWS SQS, allowing the API to respond quickly while processing happens in the background.

4. **Incomplete Modules**: The Textract and Exports modules are scaffolded but not implemented, indicating future development plans.
