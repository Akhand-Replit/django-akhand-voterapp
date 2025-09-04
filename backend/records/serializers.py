from rest_framework import serializers
from .models import Batch, Record

class BatchSerializer(serializers.ModelSerializer):
    """
    This serializer handles the translation of Batch objects.
    """
    class Meta:
        model = Batch
        # We specify that the 'id', 'name', and 'created_at' fields
        # should be included when a Batch is converted to JSON.
        fields = ['id', 'name', 'created_at']


class RecordSerializer(serializers.ModelSerializer):
    """
    This serializer handles the more complex translation of Record objects.
    """
    # This is a special read-only field. When the API sends a record,
    # this will add a 'batch_name' field to the JSON, making it easier
    # for the frontend to display the name of the batch directly.
    batch_name = serializers.CharField(source='batch.name', read_only=True)

    class Meta:
        model = Record
        # The 'fields' list specifies exactly which model fields will be
        # included in the API response. We are including all of them here.
        fields = [
            'id', 'batch', 'batch_name', 'file_name', 'kromik_no', 'naam',
            'voter_no', 'pitar_naam', 'matar_naam', 'pesha', 'occupation_details',
            'jonmo_tarikh', 'thikana', 'phone_number', 'whatsapp_number',
            'facebook_link', 'tiktok_link', 'youtube_link', 'insta_link',
            'photo_link', 'description', 'political_status',
            'relationship_status', 'gender', 'age', 'created_at'
        ]
        # This is an extra configuration. 'write_only' means that when you
        # are CREATING a new record, you only need to provide the ID number of the
        # batch. The API will not expect the full batch object details.
        extra_kwargs = {
            'batch': {'write_only': True}
        }

