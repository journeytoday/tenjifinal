import os
import json
import psycopg2
import re

# Supabase database connection string
DATABASE_URL = "postgresql://postgres:Lunalovegood2307%3F@db.enhkugircnzmuzgdoshw.supabase.co:5432/postgres"

# Folder containing JSON files
DATA_FOLDER = r"C:\Users\thejo\Desktop\ROHIT\Speeches\data"

# Connect to the Supabase database
try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    print("Connected to Supabase database successfully!")
except Exception as e:
    raise Exception(f"Error connecting to database: {e}")

# Function to create tables
def create_tables():
    protocol_table_query = """
    CREATE TABLE IF NOT EXISTS Protocol (
        id TEXT PRIMARY KEY,
        date TIMESTAMP,
        legislaturePeriod INTEGER,
        number INTEGER,
        title TEXT,
        agendaItemsCount INTEGER
    );
    """
    agenda_item_table_query = """
    CREATE TABLE IF NOT EXISTS AgendaItem (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        agendaItemNumber INTEGER,
        itemOrder INTEGER,
        date TIMESTAMP,
        protocolId TEXT REFERENCES Protocol(id) ON DELETE CASCADE,
        legislaturePeriod INTEGER,
        number INTEGER,
        matchAg TEXT
    );
    """
    cursor.execute(protocol_table_query)
    cursor.execute(agenda_item_table_query)
    conn.commit()
    print("Tables created or verified successfully.")

# Function to normalize JSON keys to lowercase
def normalize_keys(data):
    if isinstance(data, dict):
        return {key.lower(): normalize_keys(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [normalize_keys(item) for item in data]
    else:
        return data

# Function to recursively search for AgendaItems
def find_agenda_items(data):
    for key, value in data.items():
        if key.lower() == "agendaitems":
            return value
        if isinstance(value, dict):
            result = find_agenda_items(value)
            if result is not None:
                return result
    return None

# Function to clean and extract numeric AgendaItemNumber
def extract_agenda_item_number(value):
    if value is None:
        return None
    match = re.search(r"\d+", str(value))  # Extract first numeric sequence
    return int(match.group()) if match else None

# Function to insert Protocol data
def insert_protocol(protocol):
    query = """
    INSERT INTO Protocol (id, date, legislaturePeriod, number, title, agendaItemsCount)
    VALUES (%s, %s, %s, %s, %s, %s)
    ON CONFLICT (id) DO NOTHING;
    """
    cursor.execute(query, (
        protocol.get("id"),
        protocol.get("date"),
        protocol.get("legislatureperiod"),
        protocol.get("number"),
        protocol.get("title"),
        protocol.get("agendaitemscount")
    ))

# Function to insert AgendaItem data
def insert_agenda_item(item):
    agenda_item_number = extract_agenda_item_number(item.get("agendaitemnumber"))
    query = """
    INSERT INTO AgendaItem (id, title, description, agendaItemNumber, itemOrder, date, protocolId)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (id) DO NOTHING;
    """
    cursor.execute(query, (
        item.get("id"),
        item.get("title"),
        item.get("description"),
        agenda_item_number,  # Cleaned AgendaItemNumber
        item.get("order"),
        item.get("date"),
        item.get("protocolid")
    ))

# Function to update derived columns (legislaturePeriod, number, matchAg)
def update_derived_columns():
    query = """
    UPDATE AgendaItem
    SET legislaturePeriod = p.legislaturePeriod,
        number = p.number,
        matchAg = CONCAT(p.legislaturePeriod, p.number, AgendaItem.itemOrder)
    FROM Protocol p
    WHERE AgendaItem.protocolId = p.id;
    """
    cursor.execute(query)
    conn.commit()
    print("Derived columns updated successfully.")

# Main script
create_tables()

for filename in os.listdir(DATA_FOLDER):
    if filename.endswith(".json"):
        file_path = os.path.join(DATA_FOLDER, filename)
        print(f"Processing file: {filename}")
        with open(file_path, 'r', encoding='utf-8') as file:
            try:
                json_data = normalize_keys(json.load(file))
                protocol_data = json_data.get("protocol")
                if protocol_data:
                    insert_protocol(protocol_data)
                    agenda_items = find_agenda_items(json_data)
                    if agenda_items:
                        for item in agenda_items:
                            try:
                                insert_agenda_item(item)
                            except Exception as e:
                                print(f"Error inserting AgendaItem: {e}")
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON in file {filename}: {e}")

update_derived_columns()

# Close connection
cursor.close()
conn.close()
print("Database operations completed successfully.")
