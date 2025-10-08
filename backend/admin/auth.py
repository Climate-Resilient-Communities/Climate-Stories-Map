from flask import session, redirect, url_for, request, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import re

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
            username = request.form['username']
            password = request.form['password']
            user = verify_user(username, password)
            if user:
                session['user'] = {'username': user['username'], 'role': user['role']}
                return redirect(url_for('admin.index'))
            return 'Invalid credentials'
        return render_template('login.html')

    @app.route('/logout')
    def logout():
        session.pop('user', None)
        return redirect(url_for('login'))

    # Return the functions that need to be used externally
    return {
        'login_required': login_required,
        'admin_required': admin_required,
        'moderator_required': moderator_required,
        'create_user': create_user
    }