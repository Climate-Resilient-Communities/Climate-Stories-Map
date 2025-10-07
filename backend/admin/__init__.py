from flask_admin import Admin
from flask_admin.base import AdminIndexView, expose
from flask import session, redirect, url_for
from .views import PostView, UserView

def init_admin(app, collection, user_collection, admin_required, moderator_required=None):
    class ProtectedAdminIndexView(AdminIndexView):
        def is_accessible(self):
            # Allow access to admin and moderator users
            try:
                return ('user' in session and 
                        session['user'] is not None and 
                        isinstance(session['user'], dict) and 
                        session['user'].get('role') in ['admin', 'moderator'])
            except (KeyError, AttributeError, TypeError):
                return False

        def inaccessible_callback(self, name, **kwargs):
            try:
                return redirect(url_for('login'))
            except Exception:
                from flask import abort
                abort(403)

        @expose('/')
        def index(self):
            return redirect(url_for('postview.index_view'))  # Redirect to PostView by default

    # Initialize admin with the custom index view
    admin = Admin(
        app,
        name='Climate Stories Map',
        template_mode='bootstrap4',
        base_template='admin/master.html',
        index_view=ProtectedAdminIndexView()
    )

    # Add PostView and UserView
    admin.add_view(PostView(collection, 'Posts', endpoint='postview'))
    admin.add_view(UserView(user_collection, 'Users', endpoint='userview'))  # Pass user_collection here

    return admin