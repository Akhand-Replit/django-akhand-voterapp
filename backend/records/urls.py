from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BatchViewSet, RecordViewSet, DashboardStatsView, UploadDataView, 
    RelationshipStatsView, AnalysisStatsView, RecalculateAgesView,
    FamilyRelationshipViewSet, CallHistoryViewSet, EventViewSet,
    DeleteAllDataView, RecordsByEventView, RecordsByBatchView
)

router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'records', RecordViewSet, basename='record')
router.register(r'family-relationships', FamilyRelationshipViewSet, basename='familyrelationship')
router.register(r'call-history', CallHistoryViewSet, basename='callhistory')
router.register(r'events', EventViewSet, basename='event')


urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('upload-data/', UploadDataView.as_view(), name='upload-data'),
    path('relationship-stats/', RelationshipStatsView.as_view(), name='relationship-stats'),
    path('analysis-stats/', AnalysisStatsView.as_view(), name='analysis-stats'),
    path('recalculate-ages/', RecalculateAgesView.as_view(), name='recalculate-ages'),
    path('delete-all-data/', DeleteAllDataView.as_view(), name='delete-all-data'),
    
    # --- NEW URLS FOR DATA TABLES ---
    path('events/<int:event_id>/records/', RecordsByEventView.as_view(), name='event-records-list'),
    path('batches/<int:batch_id>/records/', RecordsByBatchView.as_view(), name='batch-records-list'),

    path('', include(router.urls)),
]
