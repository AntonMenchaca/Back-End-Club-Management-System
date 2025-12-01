# Club Management System - Backend API

A RESTful API built with Node.js, Express, and MySQL for managing university clubs, members, events, budgets, and requests. This backend provides comprehensive functionality for club administration with role-based access control and secure authentication.

## Features

- **Club Management** - Create, update, and manage clubs with approval workflow
- **Member Management** - User registration, profiles, and club memberships
- **Event Management** - Create events, track attendance, and manage guests
- **Budget Management** - Track club budgets and expenditures with approval workflow
- **Request Management** - Handle club creation requests and membership requests
- **Guest Management** - Manage external guests for events
- **Dashboard** - Aggregate statistics and analytics for administrators
- **Authentication & Authorization** - JWT-based authentication with role-based access control (Admin, Faculty, Student)
- **Security** - Helmet security headers, password hashing with bcrypt, CORS configuration
- **Logging** - Request logging with Morgan for development and debugging

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (with mysql2)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, bcryptjs
- **Development**: Nodemon
- **Logging**: Morgan

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher) / MariaDB
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd all-stack-club-management/Back-End-Club-Management-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

Import the SQL schema from the migrations folder:

```bash
mysql -u root -p < migrations/initial_database_setup.sql
```

Or using a GUI tool like phpMyAdmin or MySQL Workbench, import the SQL file located in the `migrations` directory.

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=CLUB_MANAGEMENT
DB_USER=root
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

**Important**: Change the `JWT_SECRET` to a strong, random string in production. Never commit the `.env` file to version control.

### 5. Run the Application

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Base URL

All API endpoints are prefixed with `/api`

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "123-456-7890",
  "department": "Computer Science",
  "year": 2024
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "Person_ID": 1,
      "First_Name": "John",
      "Last_Name": "Doe",
      "Email": "user@example.com",
      "Role_Name": "Student"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "Person_ID": 1,
      "First_Name": "John",
      "Last_Name": "Doe",
      "Email": "user@example.com",
      "Role_Name": "Student"
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /api/auth/me
Get current authenticated user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "Person_ID": 1,
    "First_Name": "John",
    "Last_Name": "Doe",
    "Email": "user@example.com",
    "Role_Name": "Student"
  }
}
```

#### POST /api/auth/logout
Logout (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

#### POST /api/auth/refresh
Refresh JWT token.

**Request Body:**
```json
{
  "token": "expired_jwt_token"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "new_jwt_token"
  }
}
```

### Club Endpoints

- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/:id` - Get club by ID
- `POST /api/clubs` - Create a new club (requires authentication)
- `PUT /api/clubs/:id` - Update club (requires authentication and permissions)
- `DELETE /api/clubs/:id` - Delete club (requires authentication and permissions)

### Member Endpoints

- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create a new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Event Endpoints

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Budget Endpoints

- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget by ID
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Membership Endpoints

- `GET /api/memberships` - Get all memberships
- `POST /api/memberships` - Create a new membership
- `DELETE /api/memberships/:id` - Remove membership

### Request Endpoints

- `GET /api/requests` - Get all requests
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create a new request
- `PUT /api/requests/:id` - Update request (e.g., approve/reject)
- `DELETE /api/requests/:id` - Delete request

### Dashboard Endpoints

- `GET /api/dashboard` - Get dashboard statistics and analytics

### Guest Endpoints

- `GET /api/guests` - Get all guests
- `GET /api/guests/:id` - Get guest by ID
- `POST /api/guests` - Create a new guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest

### Health Check

- `GET /api/health` - Server health check endpoint

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token payload includes:
- User ID
- Email
- Role (Admin, Faculty, Student)

## Role-Based Access Control

The system supports the following roles:

- **Admin** - Full system access, can manage all clubs, users, and settings
- **Faculty** - Approval and oversight capabilities, can approve club creation requests and budget expenditures
- **Student** - Basic user with club creation and event management capabilities
- **Club Leader** - Management of specific clubs they lead
- **Club Member** - View-only access to club information and ability to join events

Permissions are enforced through middleware that checks user roles and permissions before allowing access to protected endpoints.

## Database Schema

The system uses a normalized MySQL database with the following main entities:

- **PERSON** - Base table for all people (users and guests)
- **USER** - Registered users (students, faculty, admin)
- **GUEST** - External guests for events
- **CLUB** - University clubs with approval status
- **CLUB_MEMBERSHIP** - Many-to-many relationship (users <-> clubs)
- **EVENT** - Club events
- **ATTENDANCE** - Event attendance tracking
- **BUDGET** - Club budgets per academic year
- **EXPENDITURE** - Budget expense requests with approval workflow
- **REQUEST** - Club creation and membership requests

The database includes triggers for automatic club leader assignment and supports academic year budget tracking with expenditure approval workflow.

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (default Next.js dev server)
- Configurable via `FRONTEND_URL` environment variable

CORS is enabled with credentials support for cookie-based authentication if needed.

## Security Features

- **Password Hashing** - bcrypt with 10 rounds
- **JWT Authentication** - Secure token-based authentication
- **Helmet.js** - Security headers to protect against common vulnerabilities
- **SQL Injection Prevention** - Parameterized queries throughout
- **Role-Based Access Control (RBAC)** - Fine-grained permission system
- **Input Validation** - Request validation before processing
- **Error Handling** - Secure error messages that don't leak sensitive information

## Error Handling

The API uses a consistent error response format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error


## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Environment Variables

Required environment variables:

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_NAME` - Database name (default: CLUB_MANAGEMENT)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT signing (required)
- `JWT_EXPIRE` - JWT expiration time (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

### Database Migrations

The initial database schema is provided in `migrations/initial_database_setup.sql`. Run this script to set up your database:

```bash
mysql -u root -p CLUB_MANAGEMENT < migrations/initial_database_setup.sql
```

## Deployment

### Vercel

The project includes a `vercel.json` configuration file for deployment on Vercel. The serverless functions are automatically configured.

### Docker

A `Dockerfile` is included for containerized deployment. Build and run with:

```bash
docker build -t club-management-api .
docker run -p 3001:3001 --env-file .env club-management-api
```

### Other Platforms

The application can be deployed to any Node.js hosting platform (Heroku, AWS, DigitalOcean, etc.). Ensure that:

1. Environment variables are properly configured
2. Database connection is accessible
3. CORS is configured for your frontend URL
4. JWT_SECRET is set to a strong, random value


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC


## Acknowledgments

- Built for university club management
- Database schema includes triggers for automatic club leader assignment
- Supports academic year budget tracking with expenditure approval workflow
