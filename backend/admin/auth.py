from flask import session, redirect, url_for, request, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import re
import time

def validate_password_complexity(password):
    """
    Validate password complexity:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one number'
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, 'Password must contain at least one special character'
    
    return True, 'Password meets complexity requirements'

def init_auth(app, user_collection):
    # Very small in-memory rate limiter for the admin login endpoint.
    # (Works best for single-instance deployments; for multi-instance use a shared store.)
    login_failures = {}
    max_attempts = int(app.config.get('LOGIN_MAX_ATTEMPTS', 10))
    window_seconds = int(app.config.get('LOGIN_WINDOW_SECONDS', 15 * 60))
    lock_seconds = int(app.config.get('LOGIN_LOCK_SECONDS', 15 * 60))

    def _client_ip():
        forwarded_for = request.headers.get('X-Forwarded-For', '')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        return request.remote_addr or 'unknown'

    def _is_locked(ip: str) -> bool:
        entry = login_failures.get(ip)
        if not entry:
            return False
        return entry.get('locked_until', 0) > time.time()

    def _register_failure(ip: str):
        now = time.time()
        entry = login_failures.get(ip)
        if not entry or (now - entry.get('first_ts', now)) > window_seconds:
            entry = {'first_ts': now, 'count': 0, 'locked_until': 0}

        entry['count'] = entry.get('count', 0) + 1
        if entry['count'] >= max_attempts:
            entry['locked_until'] = now + lock_seconds
        login_failures[ip] = entry

    def _clear_failures(ip: str):
        login_failures.pop(ip, None)

    # User creation helper
    def create_user(username, password, role):
        # Validate password complexity
        is_valid, message = validate_password_complexity(password)
        if not is_valid:
            raise ValueError(message)
            
        hashed_password = generate_password_hash(password)
        user_collection.insert_one({'username': username, 'password': hashed_password, 'role': role})

    # User verification helper
    def verify_user(username, password):
        user = user_collection.find_one({'username': username})
        if user and check_password_hash(user['password'], password):
            return user
        return None

    # Login required decorator
    def login_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user' not in session:
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function

    # Admin required decorator
    def admin_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                if ('user' not in session or 
                    session['user'] is None or 
                    not isinstance(session['user'], dict) or 
                    session['user'].get('role') != 'admin'):
                    return redirect(url_for('login'))
            except (KeyError, AttributeError, TypeError):
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function

    # Moderator required decorator
    def moderator_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                if ('user' not in session or 
                    session['user'] is None or 
                    not isinstance(session['user'], dict) or 
                    session['user'].get('role') not in ['admin', 'moderator']):
                    return redirect(url_for('login'))
            except (KeyError, AttributeError, TypeError):
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            ip = _client_ip()
            if _is_locked(ip):
                return render_template(
                    'login.html',
                    error='Too many login attempts. Try again later.',
                    username=request.form.get('username', '').strip(),
                ), 429

            username = request.form.get('username', '').strip()
            password = request.form.get('password', '')
            user = verify_user(username, password)
            if user:
                session.clear()
                session.permanent = True
                session['user'] = {'username': user['username'], 'role': user['role']}
                _clear_failures(ip)
                return redirect(url_for('admin.index'))
            _register_failure(ip)

            # Re-render the login page with an inline error message.
            return render_template('login.html', error='Invalid credentials', username=username), 401

        return render_template('login.html')

    @app.route('/logout')
    def logout():
        session.clear()
        return redirect(url_for('login'))

    # Return the functions that need to be used externally
    return {
        'login_required': login_required,
        'admin_required': admin_required,
        'moderator_required': moderator_required,
        'create_user': create_user
    }