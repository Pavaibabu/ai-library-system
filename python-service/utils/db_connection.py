import pyodbc

def get_db_connection():
    return pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'Server=localhost\\SQLEXPRESS;'
        'Database=LibraryDB;'
        'Trusted_Connection=yes;'
        'TrustServerCertificate=yes'
    )