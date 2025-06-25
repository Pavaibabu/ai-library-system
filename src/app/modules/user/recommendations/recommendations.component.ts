import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recommendations',
  imports:[CommonModule],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {
  recommendedBooks: any[] = [];
  borrowedBookIds: number[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage:string='';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadRecommendations();
    this.loadBorrowedBooks();
  }


  loadRecommendations(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    this.isLoading = true;
    this.userService.getRecommendations(userId).subscribe({
      next: (recommendations) => {
        this.recommendedBooks = recommendations;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to get recommendations:', err);
        this.errorMessage = 'Failed to load recommendations.';
        this.isLoading = false;
      }
    });
  }

  loadBorrowedBooks() {
  const userId = Number(localStorage.getItem('userId'));
  this.userService.getBorrowHistory(userId).subscribe((history) => {
    this.borrowedBookIds = history
      .filter((b: any) => b.status === 'Borrowed')
      .map((b: any) => b.bookId);
  });
}

 isBorrowed(bookId: number): boolean {
  return this.borrowedBookIds.includes(bookId);
}
  borrowBook(bookId: number): void {
  const userId = Number(localStorage.getItem('userId'));
  if (!userId) {
    alert('User not logged in.');
    return;
  }
  console.log('Borrow Request:', { userId, bookId });

  

  this.userService.borrowBook(userId, bookId).subscribe({
    next: () => {
      this.successMessage = 'Book borrowed successfully!';
      setTimeout(()=>{this.successMessage=''},3000)
      alert('Book borrowed successfully!');
      const book = this.recommendedBooks.find(b => b.bookId === bookId);
      if (book) {
        book.status = 'Borrowed';
      }
      this.loadBorrowedBooks();
    },
    error: (err) => {
      console.error('Error borrowing book:', err);
      if (err.status === 400 && err.error === 'Book is not available.') {
        alert('Sorry, this book is currently not available.');
      } else {
        alert('Failed to borrow book. Please try again later.');
      }
    }
  });
}}