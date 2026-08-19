# Expense Tracker System - Backend

Django + Django REST Framework backend for the Expense Tracker System.

## Setup

### Prerequisites
- Python 3.9+
- pip
- MySQL 8.x (for production)

### Installation

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/v1/`

## Authentication Endpoints

### Register (FR-01)
```
POST /api/v1/auth/register/
{
    "email": "user@example.com",
    "password": "StrongPass123",
    "password_confirmation": "StrongPass123",
    "first_name": "John",
    "last_name": "Doe",
    "mobile_number": "+919876543210"
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "Account created successfully. Please log in.",
    "data": {
        "id": 1,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "mobile_number": "+919876543210"
    },
    "errors": null
}
```

### Login (FR-02)
```
POST /api/v1/auth/login/
{
    "email": "user@example.com",
    "password": "StrongPass123"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "access": "<jwt_access_token>",
        "refresh": "<jwt_refresh_token>",
        "user": {
            "id": 1,
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe"
        }
    },
    "errors": null
}
```

### Refresh Token
```
POST /api/v1/auth/token/refresh/
{
    "refresh": "<refresh_token>"
}
```

### Logout
```
POST /api/v1/auth/logout/
{
    "refresh": "<refresh_token>"
}
```

### Get Current User
```
GET /api/v1/auth/me/
Authorization: Bearer <access_token>
```

### Update Profile
```
PATCH /api/v1/auth/me/
Authorization: Bearer <access_token>
{
    "first_name": "Jane",
    "last_name": "Smith",
    "mobile_number": "+919876543211"
}
```

### Change Password
```
POST /api/v1/auth/change-password/
Authorization: Bearer <access_token>
{
    "old_password": "OldPass123",
    "new_password": "NewPass456",
    "password_confirmation": "NewPass456"
}
```

## Validation Rules

### Registration (FR-01)
- **Email:** Required, unique, valid format
- **Password:** Min 8 chars, must have uppercase, lowercase, and digit
- **Password Confirmation:** Must match password field
- **First Name:** Required, min 2 chars
- **Last Name:** Optional, min 2 chars if provided
- **Mobile Number:** Optional, valid phone format

### Login (FR-02)
- **Email:** Required, must exist
- **Password:** Required, must be correct
- User must be active

## Testing

Run all tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=apps --cov-report=html
```

Run specific test file:
```bash
pytest apps/accounts/tests.py
```

Run specific test class:
```bash
pytest apps/accounts/tests.py::UserRegistrationSerializerTest
```

Run specific test:
```bash
pytest apps/accounts/tests.py::UserRegistrationSerializerTest::test_valid_registration
```

## Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── .env
├── pytest.ini
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   └── tests.py
│   └── __init__.py
├── core/
│   ├── exceptions.py
│   └── __init__.py
└── README.md
```

## Database

### Using SQLite (Development)
Default configuration uses SQLite. No additional setup needed.

### Using MySQL (Production)
1. Create database:
   ```sql
   CREATE DATABASE expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Update `.env`:
   ```
   DB_ENGINE=django.db.backends.mysql
   DB_NAME=expense_tracker
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

## Security Notes

- **JWT Secrets:** Change `SECRET_KEY` and `JWT_SECRET_KEY` in production
- **CORS:** Configure `CORS_ALLOWED_ORIGINS` to your frontend domain
- **HTTPS:** Always use HTTPS in production
- **Password Storage:** Passwords are hashed using Django's default algorithm (PBKDF2)
- **Rate Limiting:** Auth endpoints are rate-limited (5 attempts per minute for anonymous, 1000/hour for users)

## API Response Format

All endpoints return a standard response envelope:

```json
{
    "success": bool,
    "message": "string",
    "data": {} or null,
    "errors": {} or null
}
```

## Error Responses

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Authentication credentials were not provided.",
    "data": null,
    "errors": null
}
```

### 422 Validation Error
```json
{
    "success": false,
    "message": "Validation failed",
    "data": null,
    "errors": {
        "email": ["Email already registered."]
    }
}
```

## Development

### Logging
Configure in `config/settings.py`. Currently logs to console.

### Admin Interface
Access at `/admin/` with superuser credentials.

### Database Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Revert migrations
python manage.py migrate apps/accounts 0001
```

## Next Steps

The authentication module is complete. Next phases:
1. Categories module
2. Transactions module
3. Budgets module
4. Analytics module
5. Notifications module
6. Audit logging
