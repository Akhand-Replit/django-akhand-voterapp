from rest_framework import serializers
from .models import Batch, Record, FamilyRelationship, CallHistory

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ['id', 'name', 'created_at']


class RecordSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(source='batch.name', read_only=True)
    class Meta:
        model = Record
        fields = [
            'id', 'batch', 'batch_name', 'file_name', 'kromik_no', 'naam',
            'voter_no', 'pitar_naam', 'matar_naam', 'pesha', 'occupation_details',
            'jonmo_tarikh', 'thikana', 'phone_number', 'whatsapp_number',
            'facebook_link', 'tiktok_link', 'youtube_link', 'insta_link',
            'photo_link', 'description', 'political_status',
            'relationship_status', 'gender', 'age', 'created_at'
        ]
        extra_kwargs = { 'batch': {'write_only': True} }

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
            'record': {'write_only': True} # Only need the ID when creating
        }

