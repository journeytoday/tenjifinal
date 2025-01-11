import os
import psycopg2
import json

# Database connection string
DATABASE_URL = "postgresql://postgres:Lunalovegood2307?@db.enhkugircnzmuzgdoshw.supabase.co:5432/postgres"

# Connect to Supabase PostgreSQL
def connect_to_db():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("Connected to Supabase database successfully!")
        return conn
    except Exception as e:
        print("Error connecting to the database:", e)
        exit()

# Create speech table if not exists
def create_speech_table(cursor):
    speech_table_query = """
    CREATE TABLE IF NOT EXISTS speech (
        NLPSpeechID UUID PRIMARY KEY,
        AbstractSummary TEXT,
        AbstractSummaryPEGASUS TEXT,
        GetAbstractSummaryPEGASUS TEXT,
        GetAbstractSummary TEXT,
        GetExtractiveSummary TEXT,
        ExtractiveSummary TEXT,
        EnglishTranslationOfSpeech TEXT,
        SpeakerId TEXT,
        Text TEXT,
        ProtocolNumber INTEGER,
        LegislaturePeriod INTEGER,
        AgendaItemNumber TEXT,
        Lemmas TEXT,
        MatchAg TEXT
    );
    """
    cursor.execute(speech_table_query)
    print("Table 'speech' created or verified successfully!")

# Recursive function to search for keys case-insensitively
def search_key(data, target_key):
    if isinstance(data, dict):
        for key, value in data.items():
            if key.lower() == target_key.lower():
                return value
            result = search_key(value, target_key)
            if result is not None:
                return result
    elif isinstance(data, list):
        for item in data:
            result = search_key(item, target_key)
            if result is not None:
                return result
    return None

# Insert speech data into the table
def insert_speech(cursor, conn, speech_data):
    query = """
    INSERT INTO speech (
        NLPSpeechID,
        AbstractSummary,
        AbstractSummaryPEGASUS,
        GetAbstractSummaryPEGASUS,
        GetAbstractSummary,
        GetExtractiveSummary,
        ExtractiveSummary,
        EnglishTranslationOfSpeech,
        SpeakerId,
        Text,
        ProtocolNumber,
        LegislaturePeriod,
        AgendaItemNumber,
        Lemmas,
        MatchAg
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (NLPSpeechID) DO NOTHING;
    """
    try:
        cursor.execute(query, speech_data)
        conn.commit()  # Commit each insert separately
    except Exception as e:
        conn.rollback()  # Roll back only this insertion
        print(f"Error inserting speech with ID {speech_data[0]}: {e}")

# Process files in the directory
def process_files(directory):
    conn = connect_to_db()
    cursor = conn.cursor()
    create_speech_table(cursor)

    for file_name in os.listdir(directory):
        if file_name.endswith(".json"):
            file_path = os.path.join(directory, file_name)
            print(f"Processing file: {file_name}")
            with open(file_path, "r", encoding="utf-8") as file:
                data = json.load(file)

                # Find NLPSpeeches recursively and case-insensitively
                nlp_speeches = search_key(data, "NLPSpeeches") or []
                for speech in nlp_speeches:
                    nlp_speech_id = speech.get("Id")  # Use the Id field directly as NLPSpeechID
                    if not nlp_speech_id:
                        print(f"Skipping speech without an ID in file {file_name}.")
                        continue

                    abstract_summary = speech.get("AbstractSummary")
                    abstract_summary_pegasus = speech.get("AbstractSummaryPEGASUS")
                    get_abstract_summary_pegasus = speech.get("GetAbstractSummaryPEGASUS")
                    get_abstract_summary = speech.get("GetAbstractSummary")
                    get_extractive_summary = speech.get("GetExtractiveSummary")
                    extractive_summary = speech.get("ExtractiveSummary")
                    english_translation = speech.get("EnglishTranslationOfSpeech")
                    speaker_id = speech.get("SpeakerId")
                    text = speech.get("Text")

                    # Find ProtocolNumber and LegislaturePeriod recursively
                    protocol_number = search_key(data, "Number")
                    legislature_period = search_key(data, "LegislaturePeriod")
                    agenda_item_number = speech.get("AgendaItemNumber")

                    # Find NamedEntities and aggregate lemmas
                    named_entities = search_key(speech, "NamedEntities") or []
                    lemmas = ",".join(
                        entity.get("LemmaValue", "")
                        for entity in named_entities if "LemmaValue" in entity
                    )

                    # Generate MatchAg
                    match_ag = (
                        f"{legislature_period}{protocol_number}{agenda_item_number}"
                        if legislature_period and protocol_number and agenda_item_number
                        else None
                    )

                    # Prepare data for insertion
                    speech_data = (
                        nlp_speech_id,
                        abstract_summary,
                        abstract_summary_pegasus,
                        get_abstract_summary_pegasus,
                        get_abstract_summary,
                        get_extractive_summary,
                        extractive_summary,
                        english_translation,
                        speaker_id,
                        text,
                        protocol_number,
                        legislature_period,
                        agenda_item_number,
                        lemmas,
                        match_ag,
                    )
                    insert_speech(cursor, conn, speech_data)

    conn.close()
    print("Database connection closed.")

# Path to your JSON files directory
directory_path = "C:\\Users\\thejo\\Desktop\\ROHIT\\Speeches\\data"
process_files(directory_path)
