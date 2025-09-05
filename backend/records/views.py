from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction, models
from .text_parser import parse_voter_text_file, calculate_age
from rest_framework.decorators import action
from django.db.models import Case, When, Value, IntegerField

from .models import Batch, Record, FamilyRelationship , CallHistory
from .serializers import (
    BatchSerializer, RecordSerializer, FamilyRelationshipSerializer, 
    CreateFamilyRelationshipSerializer , CallHistorySerializer
)

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
        'naam': ['icontains'],
        'voter_no': ['exact'],
        'pitar_naam': ['icontains'],
        'thikana': ['icontains'],
        'batch': ['exact'],
        'file_name': ['exact'],
        'relationship_status': ['exact'],
    }


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, format=None):
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
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        batch_name = request.data.get('batch_name')
        if not file_obj or not batch_name:
            return Response({"error": "Batch name and file are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            content = file_obj.read().decode('utf-8')
            parsed_records = parse_voter_text_file(content)
            if not parsed_records:
                return Response({"error": "No valid records found in the uploaded file."}, status=status.HTTP_400_BAD_REQUEST)
            batch, created = Batch.objects.get_or_create(name=batch_name)
            records_to_create = [
                Record(
                    batch=batch,
                    file_name=file_obj.name,
                    **prec
                ) for prec in parsed_records
            ]
            Record.objects.bulk_create(records_to_create)
            return Response({"message": f"Successfully uploaded and processed {len(records_to_create)} records into batch '{batch_name}'."}, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RelationshipStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, format=None):
        overall_stats = Record.objects.values('relationship_status').annotate(count=models.Count('id'))
        batch_stats = Record.objects.values('batch__name', 'relationship_status').annotate(count=models.Count('id')).order_by('batch__name')
        return Response({'overall': list(overall_stats), 'by_batch': list(batch_stats)})

class AnalysisStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, format=None):
        professions = Record.objects.filter(pesha__isnull=False).exclude(pesha__exact='').values('pesha').annotate(count=models.Count('pesha')).order_by('-count')
        top_professions = list(professions[:10])
        other_count = sum(p['count'] for p in professions[10:])
        if other_count > 0:
            top_professions.append({'pesha': 'Others', 'count': other_count})
        genders = Record.objects.filter(gender__isnull=False).exclude(gender__exact='').values('gender').annotate(count=models.Count('gender'))
        age_groups = Record.objects.filter(age__isnull=False).aggregate(
            group_18_25=models.Count(Case(When(age__range=(18, 25), then=Value(1)))),
            group_26_35=models.Count(Case(When(age__range=(26, 35), then=Value(1)))),
            group_36_45=models.Count(Case(When(age__range=(36, 45), then=Value(1)))),
            group_46_60=models.Count(Case(When(age__range=(46, 60), then=Value(1)))),
            group_60_plus=models.Count(Case(When(age__gt=60, then=Value(1)))),
        )
        return Response({'professions': top_professions, 'genders': list(genders), 'age_groups': age_groups})

class RecalculateAgesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        records_to_update = Record.objects.filter(jonmo_tarikh__isnull=False).exclude(jonmo_tarikh__exact='')
        updated_count = 0
        for record in records_to_update:
            new_age = calculate_age(record.jonmo_tarikh)
            if new_age is not None and new_age != record.age:
                record.age = new_age
                record.save(update_fields=['age'])
                updated_count += 1
        return Response({"message": f"Successfully recalculated and updated the age for {updated_count} records."})

# --- NEW VIEWSET FOR FAMILY RELATIONSHIPS ---
class FamilyRelationshipViewSet(viewsets.ModelViewSet):
    """
    This viewset handles creating, viewing, and deleting family relationships.
    """
    queryset = FamilyRelationship.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # Use a different serializer for the 'create' action
        if self.action == 'create':
            return CreateFamilyRelationshipSerializer
        return FamilyRelationshipSerializer

    def get_queryset(self):
        # Filter relationships based on the 'person_id' query parameter
        person_id = self.request.query_params.get('person_id')
        if person_id:
            return FamilyRelationship.objects.filter(person_id=person_id).select_related('relative')
        # Return none if no specific person is requested to avoid listing all relationships
        return FamilyRelationship.objects.none()


# --- NEW VIEWSET FOR CALL HISTORY ---
class CallHistoryViewSet(viewsets.ModelViewSet):
    """
    This viewset handles creating and viewing call logs for a voter.
    """
    queryset = CallHistory.objects.all()
    serializer_class = CallHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter call history based on the 'record_id' query parameter
        record_id = self.request.query_params.get('record_id')
        if record_id:
            return CallHistory.objects.filter(record_id=record_id)
        # Return none if no specific record is requested
        return CallHistory.objects.none()

