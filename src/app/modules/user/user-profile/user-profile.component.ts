import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service'; 

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  user: any = {};  

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const userId = 1; 
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
    this.userService.updateUserProfile(this.user.id, this.user).subscribe({
      next: (res) => {
        alert('Profile updated successfully!');
        console.log('Updated User:', this.user);
      },
      error: (err) => {
        alert('Failed to update profile.');
        console.error(err);
      }
    });
  }
}
