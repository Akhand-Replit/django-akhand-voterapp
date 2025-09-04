from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend # Import the backend

from .models import Batch, Record
from .serializers import BatchSerializer, RecordSerializer

class BatchViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions for the Batch model.
    """
    queryset = Batch.objects.all().order_by('-created_at')
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]


class RecordViewSet(viewsets.ModelViewSet):
    """
    This viewset provides the same automatic actions for the Record model.
    """
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend] # Enable the filter backend for this view
    
    # Define which fields can be used for searching and how
    filterset_fields = {
        'naam': ['icontains'], # Case-insensitive contains search
        'voter_no': ['exact'], # Must be an exact match
        'pitar_naam': ['icontains'],
        'thikana': ['icontains'],
    }


class DashboardStatsView(APIView):
    """
    A view to provide summary statistics for the main dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        """
        Return a dictionary of dashboard statistics.
        """
        total_records = Record.objects.count()
        total_batches = Batch.objects.count()
        friend_count = Record.objects.filter(relationship_status='Friend').count()
        enemy_count = Record.objects.filter(relationship_status='Enemy').count()

        stats = {
            'total_records': total_records,
            'total_batches': total_batches,
            'friend_count': friend_count,
            'enemy_count': enemy_count,
        }
        return Response(stats)

