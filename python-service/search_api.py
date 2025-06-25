import pyodbc
import pandas as pd
import spacy
from flask import jsonify
from utils.db_connection import get_db_connection

nlp = spacy.load("en_core_web_md")



def load_books():
    conn = get_db_connection()
    books_df = pd.read_sql("SELECT Id, Title, Author, Genre FROM Books", conn)
    conn.close()
    books_df = books_df[
        ~(books_df['Title'].str.lower() == 'string') &
        ~(books_df['Author'].str.lower() == 'string') &
        ~(books_df['Genre'].str.lower() == 'string')
    ]
    return books_df

def prepare_book_docs(books_df):
    book_docs = []
    for idx, row in books_df.iterrows():
        text = f"This is a book titled '{row['Title']}' written by {row['Author']}. It is a {row['Genre']} book."
        doc = nlp(text)
        book_docs.append((row['Id'], doc))
    return book_docs

def register_search_routes(app):
    books_df = load_books()
    book_docs = prepare_book_docs(books_df)

    @app.route('/search_books/<query>', methods=['GET'])
    def search_books_api(query):
        try:
            query_doc = nlp(query)
            similarities = []

            for book_id, doc in book_docs:
                similarity = query_doc.similarity(doc)
                similarities.append((similarity, book_id))

            similarities.sort(reverse=True, key=lambda x: x[0])

            top_books = []
            for score, book_id in similarities[:5]:
                book_info = books_df[books_df['Id'] == book_id].iloc[0]
                top_books.append({
                    'id': int(book_info['Id']),
                    'title': book_info['Title'],
                    'author': book_info['Author'],
                    'genre': book_info['Genre'],
                    'similarity': round(score, 3)
                })

            return jsonify(top_books)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
