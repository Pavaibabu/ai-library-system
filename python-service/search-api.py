import pyodbc
import pandas as pd
import spacy
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

def get_db_connection():
    conn = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'Server=localhost\\SQLEXPRESS;'
        'Database=LibraryDB;'
        'Trusted_Connection=yes;'
        'TrustServerCertificate=yes'
    )
    return conn

# Load books
def load_books():
    conn = get_db_connection()
    books_df = pd.read_sql("SELECT Id, Title, Author, Genre FROM Books", conn)
    conn.close()
    
    # Filter out books with dummy or placeholder values
    books_df = books_df[
        ~(books_df['Title'].str.lower() == 'string') &
        ~(books_df['Author'].str.lower() == 'string') &
        ~(books_df['Genre'].str.lower() == 'string')
    ]
    
    return books_df


# Prepare books with spaCy docs
def prepare_book_docs(books_df):
    book_docs = []
    for idx, row in books_df.iterrows():
        text = f"{row['Title']} by {row['Author']} Genre: {row['Genre']}"
        doc = nlp(text)
        book_docs.append((row['Id'], doc))
    return book_docs

# Search books
def search_books(query, books_df, book_docs, top_k=5):
    query_doc = nlp(query)
    similarities = []
    
    for book_id, doc in book_docs:
        similarity = query_doc.similarity(doc)
        similarities.append((similarity, book_id))
    
    similarities.sort(reverse=True, key=lambda x: x[0])
    
    top_books = []
    for score, book_id in similarities[:top_k]:
        book_info = books_df[books_df['Id'] == book_id].iloc[0]
        top_books.append({
            'id': int(book_info['Id']),
            'title': book_info['Title'],
            'author': book_info['Author'],
            'genre': book_info['Genre'],
            'similarity': round(score, 3)
        })
    
    return top_books

# API route
@app.route('/search_books/<query>', methods=['GET'])
def search_books_api(query):
    try:
        results = search_books(query, books_df, book_docs)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Load books on startup
print("Loading books and preparing documents...")
books_df = load_books()
book_docs = prepare_book_docs(books_df)
print("Books loaded and spaCy docs prepared.")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8001, debug=True)  
