# Super Admin Dashboard

A powerful and dynamic admin dashboard with full CRUD operations, role-based access control, and high-performance database management.

## Features

- 🔐 Advanced Authentication & Authorization
  - JWT-based authentication
  - Role-based access control (Super Admin, Admin, User)
  - Secure password hashing
  - Token validation and refresh

- 📊 Dynamic Database Management
  - Full CRUD operations on any database model
  - Dynamic table and model management
  - Bulk operations support
  - Multi-database support (MySQL, PostgreSQL)

- 🚀 High Performance
  - Connection pooling
  - Query optimization
  - Caching support
  - Rate limiting

- 📝 Logging & Monitoring
  - Detailed activity logging
  - Error tracking
  - Audit trail
  - Real-time monitoring

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and update the configurations:
   ```bash
   cp .env.example .env
   ```

4. Create the necessary database tables:
   ```sql
   CREATE TABLE users (
       id INT PRIMARY KEY AUTO_INCREMENT,
       username VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       role ENUM('super_admin', 'admin', 'user') NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   CREATE TABLE activity_logs (
       id INT PRIMARY KEY AUTO_INCREMENT,
       user_id INT,
       action VARCHAR(255) NOT NULL,
       details JSON,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

5. Start the server:
   ```bash
   # Development
   npm run dev

   # development
   npm start
   ```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Register new user (Admin only)
- POST `/api/auth/change-password` - Change password
- POST `/api/auth/validate-token` - Validate JWT token

### Model Operations
- GET `/api/models/tables` - Get all tables
- GET `/api/models/schema/:tableName` - Get table schema
- POST `/api/models/create` - Create record
- GET `/api/models/read` - Read records
- PUT `/api/models/update` - Update record
- DELETE `/api/models/delete` - Delete record
- POST `/api/models/bulk-create` - Bulk create records (Super Admin only)

## Security

- JWT Authentication
- Password hashing with bcrypt
- Rate limiting
- SQL injection protection
- XSS protection with helmet
- CORS configuration

## Error Handling

The application includes a centralized error handling system that:
- Logs errors with stack traces
- Returns appropriate HTTP status codes
- Sanitizes error messages in development
- Handles validation errors
- Manages authentication/authorization errors

## Logging

All important actions are logged using Winston:
- Error logs in `logs/error.log`
- Combined logs in `logs/combined.log`
- Console logging in development

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
