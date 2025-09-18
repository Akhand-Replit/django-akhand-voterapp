from django.db import models

class Batch(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Record(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, db_index=True)
    file_name = models.CharField(max_length=255)
    kromik_no = models.CharField("ক্রমিক নং", max_length=50)
    naam = models.TextField("নাম")
    voter_no = models.CharField("ভোটার নং", max_length=100, db_index=True)
    
    pitar_naam = models.TextField("পিতার নাম", blank=True, null=True)
    matar_naam = models.TextField("মাতার নাম", blank=True, null=True)
    pesha = models.TextField("পেশা", blank=True, null=True)
    
    occupation_details = models.TextField(blank=True, null=True)
    jonmo_tarikh = models.CharField("জন্ম তারিখ", max_length=100, blank=True, null=True)
    thikana = models.TextField("ঠিকানা", blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    whatsapp_number = models.CharField(max_length=100, blank=True, null=True)
    facebook_link = models.TextField(blank=True, null=True)
    tiktok_link = models.TextField(blank=True, null=True)
    youtube_link = models.TextField(blank=True, null=True)
    insta_link = models.TextField(blank=True, null=True)
    photo_link = models.TextField(default='https://placehold.co/100x100/EEE/31343C?text=No+Image')
    description = models.TextField(blank=True, null=True)
    political_status = models.TextField(blank=True, null=True)
    relationship_status = models.CharField(max_length=20, default='Regular', db_index=True)
    gender = models.CharField(max_length=10, blank=True, null=True, db_index=True)
    age = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.naam

class FamilyRelationship(models.Model):
    person = models.ForeignKey(Record, on_delete=models.CASCADE, related_name='relationships')
    relative = models.ForeignKey(Record, on_delete=models.CASCADE, related_name='relative_of')
    relationship_type = models.CharField(max_length=100)

    class Meta:
        unique_together = ('person', 'relative')

    def __str__(self):
        return f"{self.relative.naam} is the {self.relationship_type} of {self.person.naam}"

# --- NEW MODEL FOR CALL HISTORY ---
class CallHistory(models.Model):
    """
    Stores a log of calls made to a specific voter record.
    """
    record = models.ForeignKey(Record, on_delete=models.CASCADE, related_name='call_history')
    call_date = models.DateField()
    summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-call_date', '-created_at'] # Show the most recent calls first

    def __str__(self):
        return f"Call to {self.record.naam} on {self.call_date}"

