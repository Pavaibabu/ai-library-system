import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:5020/api/User';

  private borrowedBooksSubject = new BehaviorSubject<number[]>([]);
  borrowedBooks$ = this.borrowedBooksSubject.asObservable();

  constructor(private http: HttpClient) {}

  updateBorrowedBooks(userId: number) {
    this.getBorrowHistory(userId).subscribe(history => {
      const borrowed = history
        .filter(b => b.status === 'Borrowed')
        .map(b => b.bookId);
      this.borrowedBooksSubject.next(borrowed);
    });
  }

    browseBooks(): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/BrowseBooks`);
    }

    borrowBook(userId: number, bookId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/BorrowBook/${userId}`, {
      bookId
    }, { responseType: 'text' });
  }

    getBorrowHistory(userId: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/BorrowHistoryofUser`, {
        params: { userId }
      });
    }

    getUserProfile(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetUserProfile`, {
      params: { id }
    });
  }

    updateUserProfile(id: number, updatedUser: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateProfile/${id}`, updatedUser,{ responseType: 'text' });
  }


    returnBook(userId: number, bookId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/ReturnBook`, {
      userId,
      bookId
    }, { responseType: 'text' });
  }

  private recommendation_apiUrl = 'http://localhost:5000/recommendations'; 

  
    getRecommendations(userId: number): Observable<any> {
      return this.http.get<any[]>(`${this.recommendation_apiUrl}/${userId}`);
    }
  
  private search_apiUrl = 'http://localhost:5000'; 
      
    searchBooks(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.search_apiUrl}/search_books/${query}`);
    }
}
  


