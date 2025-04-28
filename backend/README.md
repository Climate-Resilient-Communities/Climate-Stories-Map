# CRC_Climate_Stories

## Security Features

### Password Encryption
User passwords are encrypted using Werkzeug's security functions:
- `generate_password_hash()` is used when creating or updating user passwords
- `check_password_hash()` is used for password verification during login
- Passwords are never stored in plaintext in the database

This implementation ensures that even if the database is compromised, user passwords remain protected.

### Password Complexity Requirements
The system enforces strong password requirements:
- Minimum length of 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

These requirements help protect against brute force and dictionary attacks.

### Password Handling for User Management
- When creating a new user, a password is required and must meet complexity requirements
- When editing an existing user, the password field is optional:
  - If left empty, the existing password is preserved
  - If provided, the new password must meet complexity requirements

### Implementation Details
- Password hashing is implemented in `admin/auth.py` for the `create_user` function
- Password hashing is also implemented in `admin/views.py` for the admin interface in the `UserView` class
- Password complexity validation is implemented in `admin/forms.py` using a custom validator
- Unit tests are available in `test_user_forms.py` and `test_user_view.py` to verify password handling functionality



