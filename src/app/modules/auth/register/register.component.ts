import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from "../../../components/navbar/navbar.component";
import { FooterComponent } from "../../../components/footer/footer.component";

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, NavbarComponent, ReactiveFormsModule, RouterModule, FooterComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  successMessage = '';
  errorMessage = '';
 

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['', Validators.required]
    });
  }

  register(): void {
    if (this.form.invalid) return;
    const payload = this.form.value;
    this.authService.register(payload).subscribe({
      next: (response: any) => {
        if (response.statusCode === 1) {
          this.successMessage='Registaration Successfull';
          setTimeout(()=>{this.successMessage,''},3000);
          alert(response.message);

          const registeredUser = {
            id: response.userId,
            username: payload.username,
            email: payload.email,
            role: payload.role
          };

          localStorage.setItem('user', JSON.stringify(registeredUser));

          if (registeredUser.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        } else {
          alert(response.message);
        }
      },
      error: (err: any) => {
        console.error('Registration failed:', err);
         if (err.status === 400 && err.error) {
    alert(err.error); 
  }else
  {
    alert('Something went wrong during registration.');
  }
        
      }
    });
  }

  clearForm(): void {
    this.form.reset();
  }
}

