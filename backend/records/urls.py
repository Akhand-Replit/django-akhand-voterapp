from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BatchViewSet, RecordViewSet

# A Router automatically generates the URL patterns for a ViewSet.
# This saves us from having to manually define URLs for listing, creating,
# retrieving, updating, and deleting records and batches.
router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'records', RecordViewSet, basename='record')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]

