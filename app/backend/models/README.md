# User Model Documentation

## Overview
The User model provides a comprehensive user management system with secure password handling, validation, and database integration.

## Features

### Core Fields
- `id`: Primary key (auto-incrementing integer)
- `username`: Unique username (3-80 characters, alphanumeric + underscore only)
- `email`: Unique email address (validated format)
- `password_hash`: Securely hashed password (never stored in plain text)
- `created_at`: Timestamp when user was created
- `updated_at`: Timestamp when user was last updated

### Password Security
- Uses `werkzeug.security.generate_password_hash()` for secure password hashing
- Uses `werkzeug.security.check_password_hash()` for password verification
- **Never stores plain text passwords**

### Password Complexity Requirements
Passwords must meet the following criteria:
- **Minimum 8 characters**
- **At least one uppercase letter** (A-Z)
- **At least one lowercase letter** (a-z)
- **At least one digit** (0-9)
- **At least one special character** (!@#$%^&*(),.?":{}|<>)

### Validation Rules

#### Username Validation
- Length: 3-80 characters
- Characters: Letters, numbers, and underscores only
- Must be unique in the database

#### Email Validation
- Must be a valid email format
- Must be unique in the database
- Supports standard email formats including subdomains and special characters

## Usage Examples

### Creating a New User
```python
from models.user import User

# Create a new user (password will be automatically hashed)
user = User(
    username="john_doe",
    email="john@example.com",
    password="SecurePass123!"
)

# Save to database
db.session.add(user)
db.session.commit()
```

### Checking Password
```python
# Verify a password
if user.check_password("SecurePass123!"):
    print("Password is correct!")
else:
    print("Password is incorrect!")
```

### Validation Methods
```python
# Validate username
is_valid, message = User.validate_username("john_doe")
if not is_valid:
    print(f"Username error: {message}")

# Validate email
is_valid, message = User.validate_email("john@example.com")
if not is_valid:
    print(f"Email error: {message}")

# Get password requirements
requirements = User.get_password_requirements()
print(requirements['message'])
```

### User Serialization
```python
# Convert user to dictionary (excludes password_hash)
user_dict = user.to_dict()
print(user_dict)
# Output: {'id': 1, 'username': 'john_doe', 'email': 'john@example.com', ...}
```

## Error Handling

### Password Complexity Errors
```python
try:
    user = User("test", "test@example.com", "weak")
except ValueError as e:
    print(f"Password error: {e}")
    # Output: Password error: Password does not meet complexity requirements
```

### Validation Errors
```python
# Username validation
is_valid, message = User.validate_username("ab")
# Returns: (False, "Username must be between 3 and 80 characters")

# Email validation
is_valid, message = User.validate_email("invalid-email")
# Returns: (False, "Invalid email format")
```

## Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Features

1. **Password Hashing**: Uses industry-standard PBKDF2 with SHA256
2. **Complexity Requirements**: Enforces strong password policies
3. **Input Validation**: Validates all user inputs before processing
4. **SQL Injection Protection**: Uses SQLAlchemy ORM for safe database operations
5. **Data Sanitization**: Excludes sensitive data from serialization

## Testing

Run the test suite to verify all functionality:
```bash
# Test without database (recommended for development)
python test_user_model_simple.py

# Test with database (requires MySQL setup)
python test_user_model.py
```

## Dependencies

- Flask-SQLAlchemy: Database ORM
- Werkzeug: Password hashing and security
- Python standard library: Regular expressions, datetime

## Best Practices

1. **Always validate input** before creating users
2. **Never log or display password hashes**
3. **Use HTTPS** in production for secure data transmission
4. **Implement rate limiting** for login attempts
5. **Regular security audits** of password policies 