import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:5020/api/Admin';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/View_AdminDashboard_Status`);
  }

  getAllBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ViewAllBooks`);
  }

  addBook(book: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddBook`, book);
  }

  updateBook(book: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateBook`, book);
  }
  
  deleteBook(bookId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>( `${this.baseUrl}/DeleteBookById?id=${bookId}`
    );
  }


  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ViewAllUsers`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ViewUserById?id=${id}`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AddUser`, user, {
      responseType: 'json'
    });
  }

  updateUser(user: any): Observable<any> {
  const params = new HttpParams().set('role', 'admin');
  return this.http.put(`${this.baseUrl}/UpdateUser?id=${user.id}`, user, { params });
}

  deleteUser(id: number): Observable<any> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/DeleteUserById?id=${id}`);
  }

}
