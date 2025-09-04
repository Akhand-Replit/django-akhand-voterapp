from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # This line tells Django to include all URLs from our 'records' app
    # under the prefix 'api/'. For example, the records list will be at /api/records/
    path('api/', include('records.urls')),

    # This adds the built-in login/logout views for the browsable API,
    # which we will use for testing.
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

