from flask_admin import Admin
from flask_admin.base import AdminIndexView, expose
from flask import session, redirect, url_for
import inspect
from .views import PostView, UserView

def init_admin(app, collection, user_collection, admin_required, moderator_required=None):
    """Initialize Flask-Admin with protected index view and fallback for older flask-admin versions.

    Some deployment environments may have an older flask-admin package where ``Admin.__init__``
    does not accept ``template_mode`` (and possibly ``base_template``). To keep the app
    resilient, we detect supported kwargs and only pass what the installed version supports.
    """

    class ProtectedAdminIndexView(AdminIndexView):
        def is_accessible(self):
            # Allow access to admin and moderator users
            try:
                return (
                    'user' in session and
                    session['user'] is not None and
                    isinstance(session['user'], dict) and
                    session['user'].get('role') in ['admin', 'moderator']
                )
            except (KeyError, AttributeError, TypeError):
                return False

        def inaccessible_callback(self, name, **kwargs):
            try:
                return redirect(url_for('login'))
            except Exception:  # pragma: no cover - defensive
                from flask import abort
                abort(403)

        @expose('/')
        def index(self):
            return redirect(url_for('postview.index_view'))  # Redirect to PostView by default

    # Build kwargs dynamically based on installed Admin signature
    sig = inspect.signature(Admin.__init__)
    supported = sig.parameters.keys()
    admin_kwargs = {
        'name': 'Climate Stories Map',
        'index_view': ProtectedAdminIndexView()
    }
    if 'template_mode' in supported:
        admin_kwargs['template_mode'] = 'bootstrap4'
    if 'base_template' in supported:
        admin_kwargs['base_template'] = 'admin/master.html'

    # Instantiate Admin with filtered kwargs
    admin = Admin(app, **admin_kwargs)

    # Add PostView and UserView
    admin.add_view(PostView(collection, 'Posts', endpoint='postview'))
    admin.add_view(UserView(user_collection, 'Users', endpoint='userview'))  # Pass user_collection here

    return admin