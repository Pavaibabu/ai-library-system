import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service'; 
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  user: any = {};  
  successMessage: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const userIdString = localStorage.getItem('userId'); 

    if (!userIdString) {
      console.error('No userId found in localStorage');
      return;
    }
    const userId = parseInt(userIdString, 10);
    this.userService.getUserProfile(userId).subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
      }
    });
  }

  updateProfile(): void {
    if (!this.user || !this.user.id) {
    alert('User ID is missing. Please log in again.');
    return;
  }

    this.userService.updateUserProfile(this.user.id, this.user).subscribe({
      next: (res) => {
        this.successMessage = 'Profile updated successfully!';
        alert('Profile updated successfully!');
        setTimeout(()=>{this.successMessage=''},3000)
        console.log('Updated User:', this.user);
      },
      error: (err) => {
        alert('Failed to update profile.');
        console.error(err);
      }
    });
  }
}
