import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from "../../../components/footer/footer.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  role: any;
  error = '';
  loginStatus: 'success' | 'fail' | null = null;
  loginMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.username, this.password, this.role).subscribe({
      next: (res: any) => {
        console.log('API Login Response:', res);

        if (res && res.role && res.id) {
          localStorage.setItem('userId', res.id.toString());
          localStorage.setItem('user', JSON.stringify(res));

          if (res.role.toLowerCase() === 'admin') {
            localStorage.setItem('adminId', res.id.toString());
            localStorage.setItem('adminName', res.username);  
          }

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
