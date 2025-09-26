from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as authtoken_views
from django.views.generic import TemplateView

urlpatterns = [
    # Add this line to serve the index.html at the root
    path('', TemplateView.as_view(template_name='index.html'), name='home'),

    path('admin/', admin.site.urls),
    path('api/', include('records.urls')),

    # This is the new, correct URL for our JavaScript frontend to get a token
    path('api/get-token/', authtoken_views.obtain_auth_token),

    # This provides the standard DRF login/logout views for the browsable API
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
