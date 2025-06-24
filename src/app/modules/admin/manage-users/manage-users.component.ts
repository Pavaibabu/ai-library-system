import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './manage-users.component.html'
})
export class ManageUsersComponent {
  users: any[] = [];
  allUsers: any[] = [];
  isEditMode = false;
  isUserFormVisible = false;
  successMessage: string = '';
   searchTerm:string='';

  user = {
    id: 0,
    username: '',
    email: '',
    password:'',
    role: 'User' 
  };
 

  constructor(private adminService: AdminService) {
    this.loadUsers();
  }
  formatUserId(id: number): string {
    return 'USER' + id.toString().padStart(4, '0');
    }
  loadUsers() {
    this.adminService.getAllUsers().subscribe({
     next: (data) => {
      this.allUsers = data;
      this.users = data; 
    },
      error: (err) => console.error('Error loading users:', err)
    });
  }
  searchUsers(){
    const term = this.searchTerm.toLowerCase();
     this.users = this.allUsers.filter(user =>
     user.id.toString().includes(term) ||
    user.username.toLowerCase().includes(term)
);
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

  saveUser(){
    if (this.isEditMode){
      this.updateUser()
    }
    else{
      this.addUser();
    };
  }

  addUser() {
  if (this.isEditMode) {
    this.adminService.updateUser(this.user).subscribe({
      next: (res) => {
        this.successMessage=res.message;
        alert('User updated!');
        this.closeUserForm();
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 1000);
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('Failed to update user.');
      }
    });
  } else {
    this.adminService.addUser(this.user).subscribe({
      next: (res) => {
        this.successMessage=res.message;      
        alert('User added!');
        setTimeout(()=>this.successMessage='',1000);
        this.closeUserForm();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error adding user:', err);
        alert('Failed to add user.');
      }
    });
  }
}

updateUser() {
    this.adminService.updateUser(this.user).subscribe({
      next: (res) => {
        console.log(' Update success:', res);
        this.successMessage = res.message || 'User updated successfully!';
        this.closeUserForm();    
        this.loadUsers();            
        setTimeout(() => this.successMessage = '', 3000); 
      },
      error: (err) => {
        console.error(' Update error:', err);
        alert('Failed to update book.');
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete"${user.username}"?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: (res) => {
          this.successMessage=res.message;
          alert('User deleted successfully!');
          this.loadUsers();
          setTimeout(()=>this.successMessage='',1000)
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user.');
        }
      });
    }
  }
  exportToCSV():void{
    const headers=['username','email','role'];
    const rows=this.users.map(user=>[user.username,user.email,user.role]);
    let csvContent='data:text/csv;charser=utf-8';
    csvContent+=headers.join(',')+'\n';

    rows.forEach(row=>{
      csvContent+=row.join(',')+'\n';
    })
    
    const encodeUri=encodeURI(csvContent);
    const link=document.createElement('a');
    link.setAttribute('href',encodeUri);
    link.setAttribute('download','user.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      password:'',
      role: 'user'
    };
  }
}
