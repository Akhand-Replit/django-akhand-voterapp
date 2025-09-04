from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Make sure to import the new view
from .views import BatchViewSet, RecordViewSet, DashboardStatsView

# A Router automatically generates the URL patterns for a ViewSet.
router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'records', RecordViewSet, basename='record')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    # Add the URL for our new dashboard stats view
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # Include the router-generated URLs
    path('', include(router.urls)),
]

