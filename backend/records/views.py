from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction, models
from .text_parser import parse_voter_text_file
from rest_framework.decorators import action
from django.db.models import Case, When, Value, IntegerField

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

    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        """
        Returns a list of unique file names for a given batch.
        """
        batch = self.get_object()
        files = Record.objects.filter(batch=batch).values_list('file_name', flat=True).distinct()
        return Response(sorted(list(files)))


class RecordViewSet(viewsets.ModelViewSet):
    """
    This viewset provides the same automatic actions for the Record model.
    """
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend] 
    
    filterset_fields = {
        'naam': ['icontains'], # Case-insensitive contains search
        'voter_no': ['exact'], # Must be an exact match
        'pitar_naam': ['icontains'],
        'thikana': ['icontains'],
        'batch': ['exact'],
        'file_name': ['exact'],
        'relationship_status': ['exact'],
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

class UploadDataView(APIView):
    """
    Handles the file upload and processing of voter data from a text file.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        batch_name = request.data.get('batch_name')

        if not file_obj or not batch_name:
            return Response(
                {"error": "Batch name and file are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content = file_obj.read().decode('utf-8')
            parsed_records = parse_voter_text_file(content)
            
            if not parsed_records:
                return Response(
                    {"error": "No valid records found in the uploaded file."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            batch, created = Batch.objects.get_or_create(name=batch_name)

            records_to_create = []
            for prec in parsed_records:
                record_instance = Record(
                    batch=batch,
                    file_name=file_obj.name,
                    kromik_no=prec.get('kromik_no', ''),
                    naam=prec.get('naam', 'N/A'),
                    voter_no=prec.get('voter_no', ''),
                    pitar_naam=prec.get('pitar_naam', ''),
                    matar_naam=prec.get('matar_naam', ''),
                    pesha=prec.get('pesha', ''),
                    jonmo_tarikh=prec.get('jonmo_tarikh', ''),
                    thikana=prec.get('thikana', ''),
                    age=prec.get('age')
                )
                records_to_create.append(record_instance)
            
            Record.objects.bulk_create(records_to_create)

            return Response(
                {"message": f"Successfully uploaded and processed {len(records_to_create)} records into batch '{batch_name}'."},
                status=status.HTTP_21_CREATED
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e: # Catch any other unexpected errors
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RelationshipStatsView(APIView):
    """
    Provides statistics on relationship distribution, both overall and per batch.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        # Overall stats
        overall_stats = Record.objects.values('relationship_status').annotate(count=models.Count('id'))

        # Per-batch stats
        batch_stats = Record.objects.values('batch__name', 'relationship_status').annotate(count=models.Count('id')).order_by('batch__name')

        stats = {
            'overall': list(overall_stats),
            'by_batch': list(batch_stats)
        }
        return Response(stats)

# --- NEW VIEW FOR ANALYSIS DATA ---
class AnalysisStatsView(APIView):
    """
    Provides aggregated data for charts on the Analysis page.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        # Profession stats: Top 10 professions + "Others"
        professions = Record.objects.filter(pesha__isnull=False).exclude(pesha__exact='').values('pesha').annotate(count=models.Count('pesha')).order_by('-count')
        top_professions = professions[:10]
        other_count = sum(p['count'] for p in professions[10:])
        if other_count > 0:
            top_professions = list(top_professions) + [{'pesha': 'Others', 'count': other_count}]

        # Gender stats
        genders = Record.objects.filter(gender__isnull=False).exclude(gender__exact='').values('gender').annotate(count=models.Count('gender'))

        # Age group stats
        age_groups = Record.objects.filter(age__isnull=False).aggregate(
            group_18_25=models.Count(Case(When(age__range=(18, 25), then=Value(1)))),
            group_26_35=models.Count(Case(When(age__range=(26, 35), then=Value(1)))),
            group_36_45=models.Count(Case(When(age__range=(36, 45), then=Value(1)))),
            group_46_60=models.Count(Case(When(age__range=(46, 60), then=Value(1)))),
            group_60_plus=models.Count(Case(When(age__gt=60, then=Value(1)))),
        )

        stats = {
            'professions': list(top_professions),
            'genders': list(genders),
            'age_groups': age_groups,
        }
        return Response(stats)

