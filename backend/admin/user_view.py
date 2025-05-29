from flask_admin.contrib.pymongo import ModelView
from flask_admin.contrib.pymongo.filters import FilterEqual, FilterNotEqual, FilterLike
from flask import session, redirect, url_for
from werkzeug.security import generate_password_hash
from .auth import validate_password_complexity

class UserView(ModelView):
    def __init__(self, collection, name=None, category=None, endpoint=None, url=None, static_folder=None):
        super(UserView, self).__init__(collection, name, category, endpoint, url, static_folder)

    # Restrict access to admin users only
    def is_accessible(self):
        return 'user' in session and session['user'].get('role') == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))

    # Show the "Users" button in the navigation bar only for admin users
    def is_visible(self):
        return 'user' in session and session['user'].get('role') == 'admin'

    # Use different forms for create and edit
    def get_create_form(self):
        from .forms import UserForm
        return UserForm

    def get_edit_form(self):
        from .forms import EditUserForm
        return EditUserForm

    # List of columns to display
    column_list = ('_id', 'firstname', 'lastname', 'username', 'role')

    # Rename columns for display
    column_labels = {
        '_id': 'ID',
        'firstname': 'First Name',
        'lastname': 'Last Name',
        'username': 'Username',
        'role': 'Role',
    }

    # Sortable columns
    column_sortable_list = ('firstname', 'lastname', 'username', 'role')

    # Optional: Add filters for the columns
    column_filters = ('role',)

    # Optional: Add search functionality
    column_searchable_list = ('firstname', 'lastname', 'username')

    # Optional: Format the role column for better readability
    def _role_formatter(view, context, model, name):
        role = model.get('role', 'user')
        return role.capitalize()

    column_formatters = {
        'role': _role_formatter
    }
    
    # Hash password before saving to database
    def on_model_change(self, form, model, is_created):
        # Handle password differently for create vs update
        if is_created:
            # For new users, password is required
            if 'password' in model and model['password']:
                # Validate password complexity
                is_valid, message = validate_password_complexity(model['password'])
                if not is_valid:
                    raise ValueError(message)
                    
                model['password'] = generate_password_hash(model['password'])
            else:
                raise ValueError("Password is required when creating a new user")
        else:
            # For existing users, only update password if provided
            if 'password' in model and model['password']:
                # Validate password complexity
                is_valid, message = validate_password_complexity(model['password'])
                if not is_valid:
                    raise ValueError(message)
                    
                model['password'] = generate_password_hash(model['password'])
            else:
                # If password is empty or not provided, remove it from the model to avoid updating it
                if 'password' in model:
                    del model['password']
    
    # Implement scaffold_filters method to fix NotImplementedError
    def scaffold_filters(self, name):
        """
        Return list of filters for specified field name.
        
        For MongoDB, we need to implement this method to handle filtering.
        """
        # Define which filters to use for different field types
        if name == 'role':
            return [FilterEqual(name, name), FilterNotEqual(name, name)]
        elif name in ('firstname', 'lastname', 'username'):
            return [FilterLike(name, name), FilterEqual(name, name), FilterNotEqual(name, name)]
        
        return []