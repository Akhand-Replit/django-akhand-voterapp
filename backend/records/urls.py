from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BatchViewSet, RecordViewSet, DashboardStatsView, UploadDataView, 
    RelationshipStatsView, AnalysisStatsView, RecalculateAgesView,
    FamilyRelationshipViewSet, CallHistoryViewSet, EventViewSet,
    AllRecordsView, SyncDataView
)

router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'records', RecordViewSet, basename='record')
router.register(r'family-relationships', FamilyRelationshipViewSet, basename='familyrelationship')
router.register(r'call-history', CallHistoryViewSet, basename='callhistory')
# --- NEW ROUTE FOR EVENTS ---
router.register(r'events', EventViewSet, basename='event')


urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('upload-data/', UploadDataView.as_view(), name='upload-data'),
    path('relationship-stats/', RelationshipStatsView.as_view(), name='relationship-stats'),
    path('analysis-stats/', AnalysisStatsView.as_view(), name='analysis-stats'),
    path('recalculate-ages/', RecalculateAgesView.as_view(), name='recalculate-ages'),
    path('all-records/', AllRecordsView.as_view(), name='all-records'),
    path('sync-data/', SyncDataView.as_view(), name='sync-data'),
    path('', include(router.urls)),
]
