from wtforms import form, fields, validators

class PostForm(form.Form):
    title = fields.StringField('Title')
    content_description = fields.TextAreaField('Description')  # Renamed field
    content_image = fields.StringField('Image URL', [validators.Optional()])  # Renamed field
    location_latitude = fields.FloatField('Latitude')  # Renamed field
    location_longitude = fields.FloatField('Longitude')  # Renamed field
    tag = fields.SelectField('Tag', choices=[
        ('Positive', 'Positive'),
        ('Neutral', 'Neutral'),
        ('Negative', 'Negative')
    ])
    optionalTags = fields.StringField('Optional Tags')
    status = fields.SelectField('Status', choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ])

class UserForm(form.Form):
    username = fields.StringField('Username', [validators.DataRequired(), validators.Length(min=3, max=50)])
    password = fields.PasswordField('Password', [validators.DataRequired(), validators.Length(min=6)])
    role = fields.SelectField('Role', choices=[('admin', 'Admin'), ('user', 'User')], validators=[validators.DataRequired()])
    firstname = fields.StringField('First Name', [validators.DataRequired(), validators.Length(min=1, max=50)])
    lastname = fields.StringField('Last Name', [validators.DataRequired(), validators.Length(min=1, max=50)])