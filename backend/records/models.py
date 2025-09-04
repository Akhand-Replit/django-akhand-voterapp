from django.db import models

class Batch(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Record(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    kromik_no = models.CharField("ক্রমিক নং", max_length=50)
    naam = models.TextField("নাম") # Name is essential, so we keep it required.
    voter_no = models.CharField("ভোটার নং", max_length=100)
    
    # --- UPDATED FIELDS ---
    # We add blank=True, null=True to allow these fields to be empty in the database,
    # matching the data from your old system.
    pitar_naam = models.TextField("পিতার নাম", blank=True, null=True)
    matar_naam = models.TextField("মাতার নাম", blank=True, null=True)
    pesha = models.TextField("পেশা", blank=True, null=True)
    # ----------------------

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
    relationship_status = models.CharField(max_length=20, default='Regular')
    gender = models.CharField(max_length=10, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.naam

