from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction, models
from .text_parser import parse_voter_text_file, calculate_age
from rest_framework.decorators import action
from django.db.models import Case, When, Value, IntegerField
from django.core.cache import cache


from .models import Batch, Record, FamilyRelationship , CallHistory, Event
from .serializers import (
    BatchSerializer, RecordSerializer, FamilyRelationshipSerializer, 
    CreateFamilyRelationshipSerializer , CallHistorySerializer, EventSerializer
)

# --- NEW EVENT VIEWSET ---
class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows events to be viewed or edited.
    """
    queryset = Event.objects.all().order_by('name')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def records(self, request, pk=None):
        """
        Returns a list of records associated with a specific event.
        """
        event = self.get_object()
        # FIX: Added ordering to prevent pagination warnings
        records = event.records.all().select_related('batch').order_by('id')
        
        # Paginate the results
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = RecordSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = RecordSerializer(records, many=True)
        return Response(serializer.data)


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all().order_by('-created_at')
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        batch = self.get_object()
        files = Record.objects.filter(batch=batch).values_list('file_name', flat=True).distinct()
        return Response(sorted(list(files)))


class RecordViewSet(viewsets.ModelViewSet):
    # FIX: Added default ordering to prevent pagination warnings.
    queryset = Record.objects.all().order_by('id')
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
        'kromik_no': ['exact'],
        'matar_naam': ['icontains'],
        'pesha': ['icontains'],
        'phone_number': ['icontains'],
    }

    # --- NEW ACTION TO ASSIGN EVENTS TO A RECORD ---
    @action(detail=True, methods=['post'], url_path='assign-events')
    def assign_events(self, request, pk=None):
        record = self.get_object()
        event_ids = request.data.get('event_ids', [])

        if not isinstance(event_ids, list):
            return Response(
                {'error': 'event_ids must be a list of integers.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # This will set the record's events to exactly the list provided
        events = Event.objects.filter(id__in=event_ids)
        record.events.set(events)
        
        serializer = self.get_serializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
        age_groups = Record.objects.aggregate(
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

class FamilyRelationshipViewSet(viewsets.ModelViewSet):
    # FIX: Added default ordering to prevent pagination warnings.
    queryset = FamilyRelationship.objects.all().order_by('id')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateFamilyRelationshipSerializer
        return FamilyRelationshipSerializer

    def get_queryset(self):
        person_id = self.request.query_params.get('person_id')
        if person_id:
            # FIX: Added ordering to prevent pagination warnings.
            return FamilyRelationship.objects.filter(person_id=person_id).select_related('relative').order_by('id')
        return FamilyRelationship.objects.none()

class CallHistoryViewSet(viewsets.ModelViewSet):
    queryset = CallHistory.objects.all()
    serializer_class = CallHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        record_id = self.request.query_params.get('record_id')
        if record_id:
            return CallHistory.objects.filter(record_id=record_id)
        return CallHistory.objects.none()

class AllRecordsView(APIView):
    """
    Handles fetching and caching of the entire dataset for "Import Mode".
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        cache_key = 'all_voter_data'
        
        # Try to get the data from the cache first
        cached_data = cache.get(cache_key)
        
        if cached_data:
            print("Serving all records from CACHE.")
            return Response(cached_data)
            
        # If not in cache, fetch from DB, serialize, cache it, and return it
        print("No cache found. Fetching all records from DATABASE.")
        queryset = Record.objects.select_related('batch').all().order_by('id')
        serializer = RecordSerializer(queryset, many=True)
        
        # Store in cache forever (or until invalidated)
        cache.set(cache_key, serializer.data, timeout=None)
        
        print(f"Cached {len(serializer.data)} records.")
        return Response(serializer.data)
