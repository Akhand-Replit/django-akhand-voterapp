from rest_framework import viewsets, permissions
from .models import Batch, Record
from .serializers import BatchSerializer, RecordSerializer

class BatchViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions for the Batch model.
    """
    queryset = Batch.objects.all().order_by('-created_at')
    serializer_class = BatchSerializer
    # This line ensures that only authenticated (logged-in) users
    # can access this API endpoint. This is a crucial security feature.
    permission_classes = [permissions.IsAuthenticated]


class RecordViewSet(viewsets.ModelViewSet):
    """
    This viewset provides the same automatic actions for the Record model.
    """
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    permission_classes = [permissions.IsAuthenticated]

