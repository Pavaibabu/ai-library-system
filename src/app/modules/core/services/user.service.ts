import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:5020/api/User';

  constructor(private http: HttpClient) {}

  browseBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/BrowseBooks`);
  }

  borrowBook(userId: number, bookId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/BorrowBook/${userId}`, {
      bookId: bookId
    });
  }

  
  

  getBorrowHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/BorrowHistoryofUser`, {
      params: { userId }
    });
  }

  // 3. Get User Profile
  getUserProfile(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetUserProfile`, {
      params: { id }
    });
  }

  // 4. Update User Profile
  updateUserProfile(id: number, updatedUser: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateProfile/${id}`, updatedUser);
  }

    private recommendation_apiUrl = 'http://localhost:8000/recommendations'; // Update with your Flask API URL

  
    getRecommendations(userId: number): Observable<any> {
      return this.http.get<any>(`${this.recommendation_apiUrl}/${userId}`);
    }
  
    private search_apiUrl = 'http://localhost:8001'; 
      
    searchBooks(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.search_apiUrl}/search_books/${query}`);
    }
  
}
  


