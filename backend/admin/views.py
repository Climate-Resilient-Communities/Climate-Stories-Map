from flask_admin.contrib.pymongo import ModelView
from flask_admin.contrib.pymongo.filters import FilterEqual, FilterNotEqual, FilterLike, FilterGreater, FilterSmaller
from flask_admin.model.template import macro
from markupsafe import Markup
from .forms import PostForm, UserForm
from flask import session, redirect, url_for
from wtforms import StringField, PasswordField, SelectField
from wtforms.validators import DataRequired, Length, Email

class PostView(ModelView):
    def is_accessible(self):
        return 'user' in session and session['user'].get('role') == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))

    # List of columns to display
    column_list = ('title', 'content_image_display', 'content_description', 'location', 'tag', 'optionalTags', 'created_at', 'status')
    
    # Rename columns for display
    column_labels = {
        'content_image_display': 'Image',
        'content_description': 'Description'
    }
    
    # Sortable columns
    column_sortable_list = ('title', 'created_at', 'status')
    
    # Use our custom form
    form = PostForm
    
    # Format the image display using a formatter function
    def _image_formatter(view, context, model, name):
        if model.get('content', {}).get('image'):
            return Markup(
                f'<img src="{model["content"]["image"]}" style="max-width: 100px; max-height: 100px;">'
            )
        return ''

    # Format the description display
    def _description_formatter(view, context, model, name):
        return model.get('content', {}).get('description', '')

    column_formatters = {
        'content_image_display': _image_formatter,
        'content_description': _description_formatter
    }

    def __init__(self, collection, name=None, category=None, endpoint=None, url=None, static_folder=None):
        super(PostView, self).__init__(collection, name, category, endpoint, url, static_folder)

    def on_model_change(self, form, model, is_created):        
        # Handle optionalTags - convert from string to list
        if 'optionalTags' in model and isinstance(model['optionalTags'], str):
            model['optional_tags'] = [tag_item.strip() for tag_item in model['optionalTags'].split(',')]
            # Remove optionalTags after converting to snake_case
            del model['optionalTags']
        
        # Create content dictionary
        model['content'] = {
            'description': form.content_description.data,
            'image': form.content_image.data if form.content_image.data else None
        }
        
        # Create location dictionary
        model['location'] = {
            'type': 'Point',
            'coordinates': [form.location_longitude.data, form.location_latitude.data]
        }
        
        # Remove temporary fields
        fields_to_remove = [
            'content_description', 'content_image',
            'location_latitude', 'location_longitude'
        ]
        for field in fields_to_remove:
            if field in model:
                del model[field]

    def on_form_prefill(self, form, id):
        model = self.get_one(id)
        
        # Handle optional_tags when loading form data
        if 'optional_tags' in model and isinstance(model['optional_tags'], list):
            form.optionalTags.data = ', '.join(model['optional_tags'])
        
        # Handle content and location fields
        if 'content' in model:
            if 'description' in model['content']:
                form.content_description.data = model['content']['description']
            if 'image' in model['content']:
                form.content_image.data = model['content']['image']
        
        if 'location' in model and 'coordinates' in model['location']:
            form.location_longitude.data = model['location']['coordinates'][0]
            form.location_latitude.data = model['location']['coordinates'][1]
            
    # Implement scaffold_filters method to fix NotImplementedError
    def scaffold_filters(self, name):
        """
        Return list of filters for specified field name.
        
        For MongoDB, we need to implement this method to handle filtering.
        """
        # Define which filters to use for different field types
        if name == 'title':
            return [FilterLike(name, name), FilterEqual(name, name), FilterNotEqual(name, name)]
        elif name == 'tag':
            return [FilterEqual(name, name), FilterNotEqual(name, name)]
        elif name == 'status':
            return [FilterEqual(name, name), FilterNotEqual(name, name)]
        elif name == 'created_at':
            return [FilterGreater(name, name), FilterSmaller(name, name)]
        
        return []

class UserView(ModelView):
    def __init__(self, collection, name=None, category=None, endpoint=None, url=None, static_folder=None):
        super(UserView, self).__init__(collection, name, category, endpoint, url, static_folder)

    # Restrict access to admin users only
    def is_accessible(self):
        return 'user' in session and session['user'].get('role') == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))

    # Use the custom UserForm for creating and editing users
    form = UserForm

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
    
    # Implement scaffold_filters method to fix NotImplementedError
    def scaffold_filters(self, name):
        """
        Return list of filters for specified field name.
        
        For MongoDB, we need to implement this method to handle filtering.
        """
        from flask_admin.contrib.pymongo.filters import FilterEqual, FilterNotEqual, FilterLike
        
        # Define which filters to use for different field types
        if name == 'role':
            return [FilterEqual(name, name), FilterNotEqual(name, name)]
        elif name in ('firstname', 'lastname', 'username'):
            return [FilterLike(name, name), FilterEqual(name, name), FilterNotEqual(name, name)]
        
        return []





