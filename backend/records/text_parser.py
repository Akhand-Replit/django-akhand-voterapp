import re
from datetime import datetime

# Mapping for Bengali numerals to English numerals
BENGALI_NUMERALS = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
}

def convert_bengali_numerals_to_english(text):
    """Converts Bengali numerals in a string to English numerals."""
    if not isinstance(text, str):
        return text
    for bengali, english in BENGALI_NUMERALS.items():
        text = text.replace(bengali, english)
    return text

def calculate_age(dob_str):
    """
    Calculates age from a date of birth string.
    Expects date in DD-MM-YYYY format (English numerals).
    Returns age as an integer or None if parsing fails.
    """
    if not dob_str:
        return None
    
    dob_str_english = convert_bengali_numerals_to_english(dob_str)

    try:
        # Attempt to parse common date formats
        for fmt in ["%d-%m-%Y", "%Y-%m-%d", "%m-%d-%Y", "%d/%m/%Y", "%Y/%m/%d", "%m/%d/%Y"]:
            try:
                birth_date = datetime.strptime(dob_str_english, fmt)
                today = datetime.today()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                return age
            except ValueError:
                continue # Try next format
        return None
    except Exception:
        return None

def parse_voter_text_file(content):
    """Process the text file content and extract structured data."""
    records = []

    try:
        # Remove BOM and normalize newlines
        content = content.strip().replace('\ufeff', '').replace('\r\n', '\n')

        # Split into records using both Bengali and English numerals
        raw_records = re.split(r'\n\s*(?=(?:[০-৯]+|[0-9]+)\.)', content)

        for record_text in raw_records:
            if not record_text.strip():
                continue

            record_dict = {}
            # Define field patterns with more flexible matching
            field_patterns = {
                'kromik_no': (r'^([০-৯]+|[0-9]+)\.', True),
                'naam': (r'নাম:?\s*([^,\n।]+)', False),
                'voter_no': (r'ভোটার\s*নং:?\s*([^,\n।]+)', False),
                'pitar_naam': (r'পিতা:?\s*([^,\n।]+)', False),
                'matar_naam': (r'মাতা:?\s*([^,\n।]+)', False),
                'pesha': (r'পেশা:?\s*([^,।\n]+)', False),
                'jonmo_tarikh': (r'জন্ম\s*তারিখ:?\s*([^,\n।]+)', False),
                'thikana': (r'ঠিকানা:?\s*([^,\n।]+(?:[,\n।][^,\n।]+)*)', False),
            }

            # Extract each field
            for field, (pattern, full_match) in field_patterns.items():
                match = re.search(pattern, record_text, re.MULTILINE)
                if match:
                    value = match.group(0).strip() if full_match else match.group(1).strip()
                    if field == 'kromik_no':
                        value = value.rstrip('.')
                    record_dict[field] = value.strip()
            
            # Calculate age from 'jonmo_tarikh'
            dob = record_dict.get('jonmo_tarikh')
            if dob:
                record_dict['age'] = calculate_age(dob)
            else:
                record_dict['age'] = None

            # Only add records that have at least a few key fields
            required_fields = {'kromik_no', 'naam', 'voter_no'}
            if all(field in record_dict for field in required_fields):
                records.append(record_dict)

        return records

    except Exception as e:
        # Raise an exception to be caught by the view
        raise ValueError(f"Failed to process file content: {str(e)}")
