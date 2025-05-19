import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from "../../../components/navbar/navbar.component";

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';
  role = '';
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    const payload = {
      username: this.username,
      password: this.password,
      email: this.email,
      role: this.role
    };
  
    this.authService.register(payload).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        alert("Registration successful!");
        this.router.navigate(['']); 
      },
      error: (err) => {
        console.error('Registration error:', err);
        alert(err.error || "Registration failed.");
      }
    });
  }  
  

  clearForm() {
    this.username = '';
    this.password = '';
    this.email = '';
    this.role = '';
  }
}
