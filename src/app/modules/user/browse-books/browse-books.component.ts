import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-browse-books',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './browse-books.component.html',
  styleUrl: './browse-books.component.css'
})
export class BrowseBooksComponent implements OnInit {
  books: any[] = [];
  filteredBooks: any[] = [];
  borrowedBooks: number[] = [];
  searchText: string = '';
  aiRecommendations: any[] = [];
   searchQuery = '';
     loading = false;
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadBorrowedBooks();
  }

  loadBooks(): void {
    this.userService.browseBooks().subscribe({
      next: (data: any[]) => {
        this.books = data;
        this.filteredBooks = data;
      },
      error: (err) => {
        console.error('Error loading books:', err);
      }
    });
    
  }



getSimilarityScore(bookId: number): number | null {
  const match = this.aiRecommendations.find(r => r.id === bookId);
  return match ? Math.round(match.similarity * 100) : null;
}

searchBooks(): void {
  if (!this.searchText.trim()) return;

  this.loading = true;
  this.userService.searchBooks(this.searchText).subscribe({
    next: (data) => {
      this.aiRecommendations = data;
      this.loading = false;
    },
    error: (err) => {
      console.error('Search failed', err);
      this.loading = false;
    }
  });
}

  borrowBook(bookId: number): void {
    const userId = Number(localStorage.getItem('userId'));
  
    this.userService.borrowBook(userId, bookId).subscribe({
      next: () => {
        alert(' Book borrowed successfully!');
        
        this.getAllBooks();
      },
      error: (err) => {
        console.error('Error borrowing book:', err);
        alert(' Failed to borrow book. Please try again.');
      }
    });
  }
  getAllBooks() {
    throw new Error('Method not implemented.');
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
}
