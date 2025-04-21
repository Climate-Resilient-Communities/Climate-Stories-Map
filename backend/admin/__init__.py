from flask_admin import Admin
from flask_admin.contrib.pymongo import ModelView
from flask_admin.base import AdminIndexView
from flask import session, redirect, url_for
from .views import PostView

def init_admin(app, collection, admin_required):
    class ProtectedAdminIndexView(AdminIndexView):
        def is_accessible(self):
            return 'user' in session and session['user'].get('role') == 'admin'

        def inaccessible_callback(self, name, **kwargs):
            return redirect(url_for('login'))

    # Initialize admin with protected index view
    admin = Admin(
        app,
        name='Climate Stories Map',
        template_mode='bootstrap4',
        base_template='admin/master.html',
        index_view=ProtectedAdminIndexView()
    )

    # Add your custom view
    admin.add_view(PostView(collection, 'Posts'))

    return admin