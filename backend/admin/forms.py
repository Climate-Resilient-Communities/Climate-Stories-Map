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