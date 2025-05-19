import pyodbc
import pandas as pd
import numpy as np
from flask import Flask, jsonify
from sklearn.neighbors import NearestNeighbors
from collections import defaultdict
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'Server=localhost\\SQLEXPRESS;'
        'Database=LibraryDB;'
        'Trusted_Connection=yes;'
        'TrustServerCertificate=yes'
    )
    return conn

def load_and_prepare_data():
    """Load data from database and prepare it for the recommendation engine"""
    # Get tables
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
    tables = [row[0] for row in cursor.fetchall()]
    print("Available tables:", tables)
    cursor.close()
    conn.close()
    
    # Get books data with a fresh connection
    conn = get_db_connection()
    books_df = pd.read_sql("SELECT Id, Title, Author FROM Books", conn)
    print(f"Found {len(books_df)} books in the database")
    conn.close()
    
    # Create a simple user-book interaction matrix based on BorrowedBooks table
    conn = get_db_connection()
    # Check the structure of BorrowedBooks table
    cursor = conn.cursor()
    cursor.execute("SELECT TOP 1 * FROM BorrowedBooks")
    columns = [column[0] for column in cursor.description]
    print("BorrowedBooks columns:", columns)
    cursor.close()
    
    # Get borrowing data with the correct column names
    try:
        # Assuming BorrowedBooks has UserId and BookId columns
        # Adjust column names based on what was printed above
        borrow_df = pd.read_sql("""
            SELECT UserId, BookId, COUNT(*) as borrowCount 
            FROM BorrowedBooks 
            GROUP BY UserId, BookId
        """, conn)
        print(f"Found {len(borrow_df)} borrowing records")
    except Exception as e:
        print(f"Error reading BorrowedBooks: {str(e)}")
        # Try with different column names if the first attempt fails
        cursor = conn.cursor()
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'BorrowedBooks'")
        columns = [row[0] for row in cursor.fetchall()]
        print("Actual BorrowedBooks columns:", columns)
        
        # Attempt with different column name combinations
        if 'UserID' in columns and 'BookID' in columns:
            borrow_df = pd.read_sql("""
                SELECT UserID as UserId, BookID as BookId, COUNT(*) as borrowCount 
                FROM BorrowedBooks 
                GROUP BY UserID, BookID
            """, conn)
        elif 'User_Id' in columns and 'Book_Id' in columns:
            borrow_df = pd.read_sql("""
                SELECT User_Id as UserId, Book_Id as BookId, COUNT(*) as borrowCount 
                FROM BorrowedBooks 
                GROUP BY User_Id, Book_Id
            """, conn)
        else:
            print("Could not determine column names, using generic query")
            # Get sample data to inspect
            cursor.execute("SELECT TOP 5 * FROM BorrowedBooks")
            sample_data = cursor.fetchall()
            print("Sample BorrowedBooks data:", sample_data)
            # Create an empty DataFrame as fallback
            borrow_df = pd.DataFrame(columns=['UserId', 'BookId', 'borrowCount'])
        
        cursor.close()
    
    conn.close()
    
    # Create user-item matrix
    if not borrow_df.empty:
        user_item_matrix = borrow_df.pivot_table(
            index='UserId', 
            columns='BookId', 
            values='borrowCount',
            fill_value=0
        )
        print(f"Created user-item matrix with shape: {user_item_matrix.shape}")
    else:
        # Create an empty matrix
        print("No borrowing data found. Creating empty matrix.")
        user_item_matrix = pd.DataFrame()
    
    return user_item_matrix, books_df

def train_recommender_model(user_item_matrix):
    """Train a KNN model on the user-item matrix"""
    if user_item_matrix.empty:
        print("Empty matrix, skipping model training")
        return None, user_item_matrix
    
    # Handle case with only one user
    if user_item_matrix.shape[0] <= 1:
        print("Not enough users for collaborative filtering, skipping model training")
        return None, user_item_matrix
    
    model = NearestNeighbors(metric='cosine', algorithm='brute')
    model.fit(user_item_matrix.values)
    return model, user_item_matrix

@app.route('/recommendations/<int:user_id>', methods=['GET'])
def recommend_books(user_id):
    try:
        # Get user's borrowed books
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if BorrowedBooks has userId or UserID column
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'BorrowedBooks'")
        columns = [row[0] for row in cursor.fetchall()]
        cursor.close()
        
        conn.close()
        
        # Create new connection for the actual query
        conn = get_db_connection()
        cursor = conn.cursor()
        
        user_id_column = 'UserId'
        book_id_column = 'BookId'
        
        # Find the actual column names
        user_id_candidates = ['UserId', 'UserID', 'User_Id', 'userId', 'userID']
        book_id_candidates = ['BookId', 'BookID', 'Book_Id', 'bookId', 'bookID']
        
        for col in columns:
            if col.lower() == 'userid' or col in user_id_candidates:
                user_id_column = col
            if col.lower() == 'bookid' or col in book_id_candidates:
                book_id_column = col
        
        # Get user's borrowed books
        query = f"SELECT b.Id, b.Title, b.Author FROM Books b INNER JOIN BorrowedBooks bb ON b.Id = bb.{book_id_column} WHERE bb.{user_id_column} = ?"
        cursor.execute(query, user_id)
        user_borrowed_books = cursor.fetchall()
        user_book_ids = [book[0] for book in user_borrowed_books]
        cursor.close()
        conn.close()
        
        # If user has borrowing history and we have a trained model
        if user_book_ids and knn_model is not None and not matrix.empty and user_id in matrix.index:
            # Get recommendations using KNN model
            user_idx = matrix.index.get_loc(user_id)
            user_vector = matrix.iloc[user_idx].values.reshape(1, -1)
            
            # Find similar users
            distances, indices = knn_model.kneighbors(user_vector, n_neighbors=min(6, len(matrix)))
            
            # Get recommendations based on similar users
            similar_users_indices = indices.flatten()[1:] if len(indices.flatten()) > 1 else []
            similar_users = matrix.index[similar_users_indices]
            
            # Books the user has already borrowed
            user_books_set = set(user_book_ids)
            
            # Collect book recommendations from similar users
            book_scores = defaultdict(float)
            for i, similar_user_id in enumerate(similar_users):
                similarity = 1 - distances.flatten()[i+1] if i+1 < len(distances.flatten()) else 0
                similar_user_idx = matrix.index.get_loc(similar_user_id)
                
                # Get books borrowed by similar user
                similar_user_books = matrix.columns[matrix.iloc[similar_user_idx] > 0]
                
                # Add score to each book
                for book_id in similar_user_books:
                    book_id = int(book_id)
                    if book_id not in user_books_set:
                        book_scores[book_id] += similarity
            
            # Sort books by score and get top 5
            recommended_book_ids = sorted(book_scores.items(), key=lambda x: x[1], reverse=True)[:5]
            recommended_book_ids = [book_id for book_id, score in recommended_book_ids]
        else:
            # Default to empty recommendations
            recommended_book_ids = []
        
        # If not enough recommendations, add popular books that user hasn't borrowed
        if len(recommended_book_ids) < 5:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Get books not borrowed by the user
            if user_book_ids:
                placeholders = ','.join('?' for _ in user_book_ids)
                query = f"""
                    SELECT TOP {5 - len(recommended_book_ids)} Id
                    FROM Books
                    WHERE Id NOT IN ({placeholders})
                    ORDER BY NEWID()
                """
                cursor.execute(query, user_book_ids)
            else:
                # If user has no history, just get random books
                cursor.execute(f"SELECT TOP {5 - len(recommended_book_ids)} Id FROM Books ORDER BY NEWID()")
                
            additional_books = cursor.fetchall()
            recommended_book_ids.extend([row[0] for row in additional_books])
            cursor.close()
            conn.close()
        
        # Get book details
        conn = get_db_connection()
        cursor = conn.cursor()
        recommendations = []
        for book_id in recommended_book_ids:
            cursor.execute("SELECT Id, Title, Author FROM Books WHERE Id = ?", book_id)
            book = cursor.fetchone()
            if book:
                recommendations.append({
                    'bookId': book[0],
                    'title': book[1],
                    'author': book[2]
                })
        cursor.close()
        conn.close()
        
        return jsonify(recommendations)

    except Exception as e:
        print(f"Error in recommendations: {str(e)}")
        
        # Fallback to random recommendations
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT TOP 5 Id, Title, Author FROM Books ORDER BY NEWID()")
            random_books = cursor.fetchall()
            recommendations = [{'bookId': row[0], 'title': row[1], 'author': row[2]} for row in random_books]
            cursor.close()
            conn.close()
            return jsonify(recommendations)
        except Exception as fallback_error:
            print(f"Fallback error: {str(fallback_error)}")
            if 'conn' in locals() and conn:
                conn.close()
            return jsonify({'error': str(e), 'fallback_error': str(fallback_error)}), 500

# Endpoint to retrain the model
@app.route('/retrain_model', methods=['POST'])
def retrain_model():
    try:
        global user_item_matrix, knn_model, matrix, books_df
        user_item_matrix, books_df = load_and_prepare_data()
        knn_model, matrix = train_recommender_model(user_item_matrix)
        return jsonify({'message': 'Model retrained successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Load data and train model at startup
print("Loading data and training model...")
user_item_matrix, books_df = load_and_prepare_data()
knn_model, matrix = train_recommender_model(user_item_matrix)
print("Model training complete.")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)