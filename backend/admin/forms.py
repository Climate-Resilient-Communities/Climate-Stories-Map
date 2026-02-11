from wtforms import form, fields, validators
from wtforms.validators import ValidationError
import re

def password_complexity(form, field):
    """
    Validate password complexity:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    password = field.data
    if len(password) < 8:
        raise ValidationError('Password must be at least 8 characters long')
    
    if not re.search(r'[A-Z]', password):
        raise ValidationError('Password must contain at least one uppercase letter')
    
    if not re.search(r'[a-z]', password):
        raise ValidationError('Password must contain at least one lowercase letter')
    
    if not re.search(r'[0-9]', password):
        raise ValidationError('Password must contain at least one number')
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValidationError('Password must contain at least one special character')

class PostForm(form.Form):
    title = fields.StringField('Title')
    content_description = fields.TextAreaField('Description')  # Renamed field
    content_image = fields.StringField('Image URL', [validators.Optional()])  # Renamed field
    location_latitude = fields.FloatField('Latitude')  # Renamed field
    location_longitude = fields.FloatField('Longitude')  # Renamed field
    tag = fields.SelectField('Tag', choices=[
        ('Anxious', 'Anxious'),
        ('Overwhelmed', 'Overwhelmed'),
        ('Hopeful', 'Hopeful'),
        ('Empowered', 'Empowered'),
        ('Frustrated', 'Frustrated'),
        ('Angry', 'Angry'),
        ('Concerned', 'Concerned'),
        ('Sad/Grief', 'Sad/Grief'),
        ('Motivated', 'Motivated'),
        ('Inspired', 'Inspired'),
        ('Determined', 'Determined'),
        ('Resilient', 'Resilient'),
        ('Fearful', 'Fearful'),
        ('Curious', 'Curious'),
        # Legacy tags (backward compatibility)
        ('Positive', 'Positive'),
        ('Neutral', 'Neutral'),
        ('Negative', 'Negative'),
    ])
    optionalTags = fields.StringField('Optional Tags', description='Comma-separated list of tags. Sentences are allowed within each tag.')
    story_prompt = fields.SelectField('Story Prompt', choices=[
        ('', '(none)'),
        ('A moment that stayed with me', 'A moment that stayed with me'),
        ("A change I've noticed over time", "A change I've noticed over time"),
        ("A challenge I'm facing", "A challenge I'm facing"),
        ('Something I lost', 'Something I lost'),
        ("Something I'm protecting", "Something I'm protecting"),
        ("Something I'm proud of", "Something I'm proud of"),
        ('A solution I believe in', 'A solution I believe in'),
        ('A question I have', 'A question I have'),
        ('Lived experience / One-time event', 'Lived experience / One-time event'),
        ('Personal action I took', 'Personal action I took'),
        ('Community action', 'Community action'),
        ("Something I'm worried about", "Something I'm worried about"),
        ('Something that gives me hope', 'Something that gives me hope'),
    ])
    status = fields.SelectField('Status', choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ])

class UserForm(form.Form):
    """Form for creating new users with required password"""
    username = fields.StringField('Username', [validators.DataRequired(), validators.Length(min=3, max=50)])
    password = fields.PasswordField('Password', [
        validators.DataRequired(), 
        validators.Length(min=8),
        password_complexity
    ])
    role = fields.SelectField('Role', choices=[('admin', 'Admin'), ('moderator', 'Moderator')], validators=[validators.DataRequired()])
    firstname = fields.StringField('First Name', [validators.DataRequired(), validators.Length(min=1, max=50)])
    lastname = fields.StringField('Last Name', [validators.DataRequired(), validators.Length(min=1, max=50)])

class EditUserForm(form.Form):
    """Form for editing users with optional password"""
    username = fields.StringField('Username', [validators.DataRequired(), validators.Length(min=3, max=50)])
    password = fields.PasswordField('Password', [
        validators.Optional(),  # Password is optional when editing
        validators.Length(min=8),
        password_complexity
    ], description='Leave empty to keep current password')
    role = fields.SelectField('Role', choices=[('admin', 'Admin'), ('moderator', 'Moderator')], validators=[validators.DataRequired()])
    firstname = fields.StringField('First Name', [validators.DataRequired(), validators.Length(min=1, max=50)])
    lastname = fields.StringField('Last Name', [validators.DataRequired(), validators.Length(min=1, max=50)])

