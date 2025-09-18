from django.contrib import admin
from .models import Batch, Record, Event

admin.site.register(Batch)
admin.site.register(Record)
# --- NEW: REGISTER EVENT MODEL ---
admin.site.register(Event)
