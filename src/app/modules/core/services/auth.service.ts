import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable,of,throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private baseUrl = 'http://localhost:5020/api/Auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string, role: string): Observable<any> {
    const payload = { username, password, role }; 
    return this.http.post<any>(this.baseUrl, payload);
  }

  redirectUser(role: string) {
    if (role.toLowerCase() === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role.toLowerCase() === 'user') {
      this.router.navigate(['/user']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private registerUrl = 'http://localhost:5020/api/Auth/register'; // Replace with your real API URL

  register(payload: { username: string; password: string; email: string; role: string }): Observable<any> {
    return this.http.post<any>(this.registerUrl, payload);
  }
  
}

