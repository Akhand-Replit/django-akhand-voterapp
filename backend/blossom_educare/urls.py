from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.authtoken import views as authtoken_views
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('records.urls')),
    path('api/get-token/', authtoken_views.obtain_auth_token),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # This catch-all route will serve the frontend's index.html for any path not caught above.
    re_path(r'^.*', TemplateView.as_view(template_name='index.html'), name='home'),
]

# This is new: it tells Django to serve static files when DEBUG is False
if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
