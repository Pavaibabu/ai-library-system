from flask import jsonify
from flask import request
from collections import defaultdict
from sklearn.neighbors import NearestNeighbors
import pandas as pd
from utils.db_connection import get_db_connection

def load_and_prepare_data():
    conn = get_db_connection()
    books_df = pd.read_sql("SELECT Id, Title, Author FROM Books", conn)
    conn.close()

    conn = get_db_connection()
    borrow_df = pd.read_sql("""
        SELECT UserId, BookId, COUNT(*) as borrowCount 
        FROM BorrowedBooks 
        GROUP BY UserId, BookId
    """, conn)
    conn.close()

    if not borrow_df.empty:
        user_item_matrix = borrow_df.pivot_table(
            index='UserId',
            columns='BookId',
            values='borrowCount',
            fill_value=0
        )
    else:
        user_item_matrix = pd.DataFrame()
    
    return user_item_matrix, books_df

def train_recommender_model(user_item_matrix):
    if user_item_matrix.empty or user_item_matrix.shape[0] <= 1:
        return None, user_item_matrix

    model = NearestNeighbors(metric='cosine', algorithm='brute')
    model.fit(user_item_matrix.values)
    return model, user_item_matrix

knn_model = None
matrix = None
books_df = None

def register_recommendation_routes(app):
    global knn_model, matrix, books_df
    user_item_matrix, books_df = load_and_prepare_data()
    knn_model, matrix = train_recommender_model(user_item_matrix)

    @app.route('/recommendations/<int:user_id>', methods=['GET'])
    def recommend_books(user_id):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if BorrowedBooks has userId or UserID column
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'BorrowedBooks'")
            columns = [row[0] for row in cursor.fetchall()]
            cursor.close()
            
            conn.close()
            
            user_id_column = 'UserId'
            book_id_column = 'BookId'
            
           
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
                
                user_idx = matrix.index.get_loc(user_id)
                user_vector = matrix.iloc[user_idx].values.reshape(1, -1)
                
               
                distances, indices = knn_model.kneighbors(user_vector, n_neighbors=min(6, len(matrix)))
                
               
                similar_users_indices = indices.flatten()[1:] if len(indices.flatten()) > 1 else []
                similar_users = matrix.index[similar_users_indices]
                
                user_books_set = set(user_book_ids)
                
                # Collect book recommendations from similar users
                book_scores = defaultdict(float)
                for i, similar_user_id in enumerate(similar_users):
                    similarity = 1 - distances.flatten()[i+1] if i+1 < len(distances.flatten()) else 0
                    similar_user_idx = matrix.index.get_loc(similar_user_id)
                    
                  
                    similar_user_books = matrix.columns[matrix.iloc[similar_user_idx] > 0]
                    
                  
                    for book_id in similar_user_books:
                        book_id = int(book_id)
                        if book_id not in user_books_set:
                            book_scores[book_id] += similarity
                
                # Sort books by score and get top 5
                recommended_book_ids = sorted(book_scores.items(), key=lambda x: x[1], reverse=True)[:5]
                recommended_book_ids = [book_id for book_id, score in recommended_book_ids]
            else:
                recommended_book_ids = []
            
           
            if len(recommended_book_ids) < 5:
                conn = get_db_connection()
                cursor = conn.cursor()
                
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
                    cursor.execute(f"SELECT TOP {5 - len(recommended_book_ids)} Id FROM Books ORDER BY NEWID()")
                    
                additional_books = cursor.fetchall()
                recommended_book_ids.extend([row[0] for row in additional_books])
                cursor.close()
                conn.close()
            
            conn = get_db_connection()
            cursor = conn.cursor()
            recommendations = []
            for book_id in recommended_book_ids:
                cursor.execute("SELECT Id, Title, Author FROM Books WHERE Id = ?", book_id)
                book = cursor.fetchone()
                if book:
                    recommendations.append({
                        'bookId': book[0],
                        'title': book[1].strip(),
                        'author': book[2].strip()
                    })
            cursor.close()
            conn.close()
            
            return jsonify(recommendations)

        except Exception as e:
            print(f"Error in recommendations: {str(e)}")
            
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
            pass

    @app.route('/retrain_model', methods=['POST'])
    def retrain_model():
        try:
            global user_item_matrix, knn_model, matrix, books_df
            user_item_matrix, books_df = load_and_prepare_data()
            knn_model, matrix = train_recommender_model(user_item_matrix)
            return jsonify({'message': 'Model retrained successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            


