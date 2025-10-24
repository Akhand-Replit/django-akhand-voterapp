from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.authtoken import views as authtoken_views
from django.views.generic import TemplateView
from django.conf import settings
# Import static helper like in v1 for production static serving consistency
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('records.urls')),
    path('api/get-token/', authtoken_views.obtain_auth_token),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

# Use the same production static file serving method as v1
if not settings.DEBUG:
    # This relies on STATIC_ROOT being set and collectstatic having been run
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# The catch-all pattern for the frontend MUST be the last one added.
urlpatterns.append(re_path(r'^.*', TemplateView.as_view(template_name='index.html'), name='home'))
