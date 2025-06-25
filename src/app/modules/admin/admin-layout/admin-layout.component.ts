import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule,NgIf],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent 
{
  
  showLogoutAlert = false;
  username: string = 'Admin';  
  constructor(private adminService: AdminService,private router:Router) {}

  ngOnInit(): void {
    const storedName = localStorage.getItem('adminName');
    const adminId = localStorage.getItem('adminId');

    if (storedName) {
      this.username = storedName;
    } else if (adminId) {
      this.adminService.getUserById(+adminId).subscribe({
        next: (admin: any) => {
          this.username = admin.username || 'Admin';
          localStorage.setItem('adminName', this.username); 
        },
        error: (err) => {
          console.error('Failed to load admin name:', err);
        }
      });
    }
  }
 
logout(): void {
  const confirmed = confirm('Are you sure you want to logout?');

  if (confirmed) {
    localStorage.clear();
    this.showLogoutAlert = true;
    setTimeout(() => {
      this.showLogoutAlert = false;
      this.router.navigate(['/']);
    }, 1000);
  }
}
}
