# Club Management System - Backend API

A RESTful API built with Node.js, Express, and MySQL for managing university clubs, members, events, and budgets.

## Features

- Club Management - Create, update, and manage clubs with approval workflow
- Member Management - User registration, profiles, and club memberships
- Event Management - Create events, track attendance
- Budget Management - Track club budgets and expenditures
- Authentication & Authorization - JWT-based auth with role-based access (Admin, Faculty, Student)
- Security - Helmet security headers, password hashing with bcrypt
- CORS - Configured for React frontend integration
- Logging - Request logging with Morgan

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MySQL (with mysql2)
- Authentication: JWT (JSON Web Tokens)
- Security: Helmet, bcryptjs
- Development: Nodemon

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher) / MariaDB
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd full-stack-club-management/back-end
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

Import the SQL schema:

```bash
mysql -u root -p < path/to/CLUB_MANAGEMENT-3\ 2.sql
```

Or using a GUI tool like phpMyAdmin, import the SQL file.

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=CLUB_MANAGEMENT
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

### 5. Run the Application

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

Request Body:
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

Response:
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

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
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

Headers:
```
Authorization: Bearer <token>
```

Response:
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

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

#### POST /api/auth/refresh
Refresh JWT token.

Request Body:
```json
{
  "token": "expired_jwt_token"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "token": "new_jwt_token"
  }
}
```

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

- Admin - Full system access
- Faculty - Approval and oversight capabilities
- Student - Basic user with club creation and event management
- Club Leader - Management of specific clubs
- Club Member - View-only access to club information

## Database Schema

The system uses a normalized MySQL database with the following main entities:

- PERSON - Base table for all people (users and guests)
- USER - Registered users (students, faculty, admin)
- GUEST - External guests for events
- CLUB - University clubs with approval status
- CLUB_MEMBERSHIP - Many-to-many relationship (users <-> clubs)
- EVENT - Club events
- ATTENDANCE - Event attendance tracking
- BUDGET - Club budgets per academic year
- EXPENDITURE - Budget expense requests with approval workflow

## Project Structure

```
back-end/
├── config/
│   └── database.js          # MySQL connection pool
├── controllers/             # Business logic
│   └── authController.js    # Authentication
├── models/                  # Database models
│   └── User.js
├── routes/                  # API routes
│   └── authRoutes.js
├── middleware/
│   └── auth.js             # JWT authentication
├── lib/
│   └── permissions.js      # Permission definitions
├── migrations/              # Database migrations
├── services/                # Business services
├── .env                     # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (default React dev server)
- Configurable via `FRONTEND_URL` environment variable

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Helmet.js for security headers
- SQL injection prevention with parameterized queries
- Role-based access control (RBAC)
- Permission-based authorization

## Error Handling

The API uses consistent error response format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP status codes:
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Environment Variables

Required environment variables:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_NAME` - Database name (default: CLUB_MANAGEMENT)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - JWT expiration time (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

## Testing

(Coming soon)

```bash
npm test
```

## Future Enhancements

- Input validation with express-validator
- API rate limiting
- Pagination for list endpoints
- File uploads (club logos, event images)
- Email notifications
- Swagger/OpenAPI documentation
- Unit and integration tests
- Admin dashboard analytics endpoints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Author

Anton Menchaca

## Acknowledgments

- Built for university club management
- Database schema includes triggers for automatic club leader assignment
- Supports academic year budget tracking with expenditure approval workflow
