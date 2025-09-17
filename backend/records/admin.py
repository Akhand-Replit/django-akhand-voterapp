from django.contrib import admin
from .models import Batch, Record, Event, CallHistory, FamilyRelationship

# Register your models here to make them accessible in the Django admin interface.
admin.site.register(Batch)
admin.site.register(Record)
admin.site.register(Event)
admin.site.register(CallHistory)
admin.site.register(FamilyRelationship)
