import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-borrow-history',
  templateUrl: './borrow-history.component.html',
  styleUrls: ['./borrow-history.component.css'],
  imports: [NgIf,NgFor,FormsModule,CommonModule,]
})
export class BorrowHistoryComponent implements OnInit {

  borrowHistory: any[] = [];
  userId: number = 12; 

  constructor(private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));
  
    if (userId) {
      this.userService.getBorrowHistory(userId).subscribe(data => {
        this.borrowHistory = data;
      });
    } else {
      console.error('User ID not found in localStorage');
    }
  }
  
  
  loadBorrowHistory(): void {
    this.userService.getBorrowHistory(this.userId).subscribe({
      next: (data) => {
        this.borrowHistory = data;
      },
      error: (err) => {
        console.error('Error fetching borrow history:', err);
      }
    });
  }
}
