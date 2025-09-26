import psycopg2
from psycopg2.extras import RealDictCursor
from django.core.management.base import BaseCommand
from records.models import Batch, Record

# --- IMPORTANT: CONFIGURE YOUR OLD DATABASE CONNECTION HERE ---
OLD_DB_CONFIG = {
    'dbname': 'postgres',
    'user': 'voterdata',
    'password': 'AkhandFoundation_VoterData',
    'host': '69.62.124.103',
    'port': '5450'
}
# -------------------------------------------------------------

class Command(BaseCommand):
    help = 'Imports data from the old PostgreSQL database into the new Django-managed database.'

    def handle(self, *args, **options):
        self.stdout.write("Starting data import process...")

        try:
            # CORRECTED VARIABLE NAME HERE
            old_conn = psycopg2.connect(**OLD_DB_CONFIG)
            old_cursor = old_conn.cursor(cursor_factory=RealDictCursor)
            self.stdout.write(self.style.SUCCESS("Successfully connected to the old database."))
        except psycopg2.OperationalError as e:
            self.stderr.write(self.style.ERROR(f"Could not connect to the old database: {e}"))
            return

        # 1. Import Batches
        self.stdout.write("Importing batches...")
        old_cursor.execute("SELECT * FROM batches;")
        old_batches = old_cursor.fetchall()
        
        batch_map = {} # To map old batch IDs to new batch IDs
        for old_batch in old_batches:
            new_batch, created = Batch.objects.get_or_create(
                name=old_batch['name'],
                defaults={'created_at': old_batch['created_at']}
            )
            batch_map[old_batch['id']] = new_batch.id
            if created:
                self.stdout.write(f"  - Created batch: {new_batch.name}")
            else:
                self.stdout.write(f"  - Found existing batch: {new_batch.name}")

        self.stdout.write(self.style.SUCCESS(f"{len(batch_map)} batches processed."))

        # 2. Import Records
        self.stdout.write("Importing records... (This may take a while)")
        old_cursor.execute("SELECT * FROM records;")
        old_records = old_cursor.fetchall()
        
        records_to_create = []
        for i, old_record in enumerate(old_records):
            new_batch_id = batch_map.get(old_record['batch_id'])
            if not new_batch_id:
                self.stdout.write(self.style.WARNING(f"Skipping record {old_record['id']} due to missing batch mapping."))
                continue

            # Create a Record object instance without saving it to the DB yet
            record_instance = Record(
                batch_id=new_batch_id,
                file_name=old_record.get('file_name', ''),
                kromik_no=old_record.get('ক্রমিক_নং', ''),
                naam=old_record.get('নাম', 'N/A'),
                voter_no=old_record.get('ভোটার_নং', ''),
                pitar_naam=old_record.get('পিতার_নাম', ''),
                matar_naam=old_record.get('মাতার_নাম', ''),
                pesha=old_record.get('পেশা', ''),
                occupation_details=old_record.get('occupation_details'),
                jonmo_tarikh=old_record.get('জন্ম_তারিখ', ''),
                thikana=old_record.get('ঠিকানা', ''),
                phone_number=old_record.get('phone_number'),
                whatsapp_number=old_record.get('whatsapp_number'),
                facebook_link=old_record.get('facebook_link'),
                tiktok_link=old_record.get('tiktok_link'),
                youtube_link=old_record.get('youtube_link'),
                insta_link=old_record.get('insta_link'),
                photo_link=old_record.get('photo_link', 'https://placehold.co/100x100/EEE/31343C?text=No+Image'),
                description=old_record.get('description'),
                political_status=old_record.get('political_status'),
                relationship_status=old_record.get('relationship_status', 'Regular'),
                gender=old_record.get('gender'),
                age=old_record.get('age'),
                created_at=old_record.get('created_at')
            )
            records_to_create.append(record_instance)
            
            # Provide progress update
            if (i + 1) % 1000 == 0:
                self.stdout.write(f"  - Prepared {i + 1} / {len(old_records)} records...")
        
        # Use bulk_create for massive performance improvement
        self.stdout.write("Saving records to the new database...")
        Record.objects.bulk_create(records_to_create, batch_size=1000)

        # Close the old database connection
        old_cursor.close()
        old_conn.close()

        self.stdout.write(self.style.SUCCESS(f"Successfully imported {len(records_to_create)} records."))
        self.stdout.write(self.style.SUCCESS("Data import complete!"))

