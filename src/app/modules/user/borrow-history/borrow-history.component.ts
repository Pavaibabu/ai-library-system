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
  borrowedBooks:number[]=[];
  userId: number = 0; 
  successMessage: string = '';

  constructor(private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));
     this.userId = userId;
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
  loadBorrowedBooks(): void {
    const userId = Number(localStorage.getItem('userId')); // or from your auth service
    this.userService.getBorrowHistory(userId).subscribe({
      next: (data) => {
        this.borrowedBooks = data.map(b => b.bookId);
      },
      error: (err) => {
        console.error('Error fetching borrowed books:', err);
      }
    });
  }

  isBorrowed(bookId: number): boolean {
    return this.borrowedBooks.includes(bookId);
  }
  
  returnBook(bookId: number): void {
    const userId = Number(localStorage.getItem('userId'));
    this.userService.returnBook(userId, bookId).subscribe({
    next: () => {
          alert('Book returned successfully!');
          this.successMessage = 'Book returned successfully!';
          setTimeout(()=>{this.successMessage = '';}, 3000);
          this.borrowHistory = this.borrowHistory.filter(book => book.id !== bookId);
          this.loadBorrowHistory(); 
          this.userService.updateBorrowedBooks(this.userId);
        },
    error: (err) => {
          console.error('Error returning book:', err);
          alert('Failed to return book.');
        }
      });
    }

  
  
}
