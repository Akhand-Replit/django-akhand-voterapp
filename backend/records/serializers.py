from rest_framework import serializers
from .models import Batch, Record, FamilyRelationship, CallHistory, Event

# --- NEW EVENT SERIALIZER ---
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'name', 'created_at']

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ['id', 'name', 'created_at']


class RecordSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(source='batch.name', read_only=True)
    # --- Display event names in record details (read-only) ---
    event_names = serializers.StringRelatedField(source='events', many=True, read_only=True)

    class Meta:
        model = Record
        fields = [
            'id', 'batch', 'batch_name', 'file_name', 'kromik_no', 'naam',
            'voter_no', 'pitar_naam', 'matar_naam', 'pesha', 'occupation_details',
            'jonmo_tarikh', 'thikana', 'phone_number', 'whatsapp_number',
            'facebook_link', 'tiktok_link', 'youtube_link', 'insta_link',
            'photo_link', 'description', 'political_status',
            'relationship_status', 'gender', 'age', 'created_at',
            'events', # --- MODIFIED: Added 'events' to allow writing M2M relationships ---
            'event_names'
        ]
        # By including 'events', the serializer will expect a list of event IDs on update.

class SimpleRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = ['id', 'naam', 'voter_no']

class FamilyRelationshipSerializer(serializers.ModelSerializer):
    relative = SimpleRecordSerializer(read_only=True)
    class Meta:
        model = FamilyRelationship
        fields = ['id', 'relative', 'relationship_type']

class CreateFamilyRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyRelationship
        fields = ['person', 'relative', 'relationship_type']

class CallHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CallHistory
        fields = ['id', 'record', 'call_date', 'summary', 'created_at']
        extra_kwargs = {
            'record': {'write_only': True} 
        }
