import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html'
})
export class ManageUsersComponent {
  users: any[] = [];
  isEditMode = false;
  isUserFormVisible = false;

  user = {
    id: 0,
    username: '',
    email: '',
    role: 'user' // or 'admin'
  };

  constructor(private adminService: AdminService) {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error loading users:', err)
    });
  }

  openAddUserForm() {
    this.isUserFormVisible = true;
    this.isEditMode = false;
    this.resetForm();
  }

  editUser(user: any) {
    this.user = { ...user };
    this.isEditMode = true;
    this.isUserFormVisible = true;
  }

  deleteUser(user: any) {
    if (confirm(`Delete user "${user.username}"?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          alert('User deleted successfully!');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user.');
        }
      });
    }
  }

  saveUser() {
    this.adminService.updateUser(this.user).subscribe({
      next: () => {
        alert(this.isEditMode ? 'User updated!' : 'User saved!');
        this.closeUserForm();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error saving user:', err);
        alert('Failed to save user.');
      }
    });
  }

  closeUserForm() {
    this.isUserFormVisible = false;
    this.resetForm();
  }

  resetForm() {
    this.user = {
      id: 0,
      username: '',
      email: '',
      role: 'user'
    };
  }
}
