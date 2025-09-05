from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BatchViewSet, RecordViewSet, DashboardStatsView, UploadDataView, RelationshipStatsView, AnalysisStatsView

router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'records', RecordViewSet, basename='record')

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('upload-data/', UploadDataView.as_view(), name='upload-data'),
    path('relationship-stats/', RelationshipStatsView.as_view(), name='relationship-stats'),
    # --- NEW URL ---
    path('analysis-stats/', AnalysisStatsView.as_view(), name='analysis-stats'),
    path('', include(router.urls)),
]

