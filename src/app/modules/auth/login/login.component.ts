import { Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { NavbarComponent } from "../../../components/navbar/navbar.component";

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
role: any;
loginStatus: 'success' | 'fail' | null = null;
loginMessage: string = '';

  constructor(private authService: AuthService) {}

  

  login() {
    this.authService.login(this.username, this.password, this.role).subscribe({
      next: (res: any) => {
        console.log('API Login Response:', res);
  
        if (res && res.role && res.id) {
          localStorage.setItem('userId', res.id.toString());
          localStorage.setItem('user', JSON.stringify(res));
  
          this.loginStatus = 'success';
          this.loginMessage = 'Login successful...';
  
          setTimeout(() => {
            this.authService.redirectUser(res.role);
          }, 1000); 
        } else {
          this.loginStatus = 'fail';
          this.loginMessage = 'Invalid role or user ID in response.';
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.loginStatus = 'fail';
        this.loginMessage = 'Invalid username or password.';
      }
    });
  }
  
}
  

