import os
import json
import psycopg2

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

# Function to create the Protocol table
def create_table():
    create_table_query = """
    CREATE TABLE IF NOT EXISTS Protocol (
        id TEXT PRIMARY KEY,
        date TIMESTAMP,
        legislaturePeriod INTEGER,
        number INTEGER,
        title TEXT,
        agendaItemsCount INTEGER
    );
    """
    cursor.execute(create_table_query)
    conn.commit()
    print("Protocol table created or verified successfully.")

# Function to check if a record already exists based on Id
def record_exists(protocol_id):
    query = "SELECT 1 FROM Protocol WHERE id = %s"
    cursor.execute(query, (protocol_id,))
    return cursor.fetchone() is not None

# Function to normalize JSON keys to lowercase for case insensitivity
def normalize_keys(data):
    if isinstance(data, dict):
        return {key.lower(): normalize_keys(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [normalize_keys(item) for item in data]
    else:
        return data

# Function to insert data into the Protocol table
def insert_protocol_data(protocol):
    query = """
    INSERT INTO Protocol (id, date, legislaturePeriod, number, title, agendaItemsCount)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (
        protocol.get("id"),  # Use Id as the primary key
        protocol.get("date"),
        protocol.get("legislatureperiod"),
        protocol.get("number"),
        protocol.get("title"),
        protocol.get("agendaitemscount")
    ))

# Main script
create_table()  # Ensure the Protocol table exists

# Process all JSON files in the folder
for filename in os.listdir(DATA_FOLDER):
    if filename.endswith(".json"):
        file_path = os.path.join(DATA_FOLDER, filename)
        print(f"Processing file: {filename}")
        with open(file_path, 'r', encoding='utf-8') as file:
            try:
                json_data = normalize_keys(json.load(file))  # Normalize keys to lowercase
                protocol_data = json_data.get("protocol")
                
                if not protocol_data:
                    print(f"No Protocol data found in {filename}, skipping...")
                    continue

                protocol_id = protocol_data.get("id")
                if not protocol_id:
                    print(f"Protocol data in {filename} is missing an Id, skipping...")
                    continue
                
                if not record_exists(protocol_id):  # Check for duplicates
                    insert_protocol_data(protocol_data)
                else:
                    print(f"Duplicate record found: {protocol_id}, skipping...")
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON in {filename}: {e}")

# Commit changes and close the database connection
try:
    conn.commit()
    print("Data insertion completed successfully!")
finally:
    cursor.close()
    conn.close()
    print("Database connection closed.")
