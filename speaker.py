import json
import psycopg2

# Database connection details
DATABASE_URL = "postgresql://postgres:Lunalovegood2307?@db.enhkugircnzmuzgdoshw.supabase.co:5432/postgres"

# Table creation function
def create_speaker_table(cursor):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS Speaker (
        SpeakerId VARCHAR PRIMARY KEY,
        FirstName VARCHAR,
        LastName VARCHAR,
        AcademicTitle VARCHAR,
        Gender VARCHAR,
        Party VARCHAR,
        Fraction VARCHAR,
        FullName VARCHAR
    );
    """
    cursor.execute(create_table_query)

# Insert speaker data into the database
def insert_speaker(cursor, speaker_data):
    insert_query = """
    INSERT INTO Speaker (SpeakerId, FirstName, LastName, AcademicTitle, Gender, Party, Fraction, FullName)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (SpeakerId) DO NOTHING;
    """
    cursor.execute(insert_query, speaker_data)

# Process the JSON file and insert data into the Speaker table
def process_speaker_file(file_path, connection):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    with connection.cursor() as cursor:
        for entry in data:
            if entry["status"] == "200" and "result" in entry:
                result = entry["result"]
                speaker_id = result.get("speakerId", "")
                first_name = result.get("firstName", "")
                last_name = result.get("lastName", "")
                academic_title = result.get("academicTitle", "")
                gender = result.get("gender", "")
                party = result.get("party", "")
                fraction = result.get("fraction", "")

                # Create the full name based on available fields
                full_name = f"{academic_title} {first_name} {last_name}".strip()
                full_name = " ".join(full_name.split())  # Remove extra spaces

                # Insert speaker data
                insert_speaker(cursor, (speaker_id, first_name, last_name, academic_title, gender, party, fraction, full_name))

# Main function to manage database connection and processing
def main():
    try:
        connection = psycopg2.connect(DATABASE_URL)
        connection.autocommit = True

        with connection.cursor() as cursor:
            create_speaker_table(cursor)

        # Path to the JSON file
        json_file_path = r"C:\Users\thejo\Desktop\ROHIT\Speeches\speaker-details.json"
        process_speaker_file(json_file_path, connection)

        print("Speaker data has been successfully processed and inserted into the database.")
    except Exception as e:
        print("An error occurred:", e)
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    main()
