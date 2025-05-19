import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  username: string = 'Admin';  

  constructor(private adminService: AdminService) {}

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
    localStorage.clear();
    window.location.href = '/'; 
  }
}
