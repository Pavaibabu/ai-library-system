import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeleteBookById?id=${id}`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ViewAllUsers`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ViewUserById?id=${id}`);
  }

  addUser(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/AddUser`);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateUser`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeleteUserById?id=${id}`);
  }

}
