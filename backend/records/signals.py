from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Record, Batch, Event, FamilyRelationship, CallHistory

@receiver([post_save, post_delete], sender=Record)
@receiver([post_save, post_delete], sender=Batch)
@receiver([post_save, post_delete], sender=Event)
@receiver([post_save, post_delete], sender=FamilyRelationship)
@receiver([post_save, post_delete], sender=CallHistory)
def clear_all_records_cache(sender, instance, **kwargs):
    """
    Invalidates the 'all_voter_data' cache whenever a relevant model instance
    is saved or deleted.
    """
    cache_key = 'all_voter_data'
    if cache.has_key(cache_key):
        cache.delete(cache_key)
        print(f"CACHE INVALIDATED: '{cache_key}' was cleared due to an update in {sender.__name__}.")