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
  successMessage: string = '';
  loading = false;
  constructor(private userService: UserService) {}

 ngOnInit(): void {
  this.loadBooks();

  const userId = Number(localStorage.getItem('userId'));
  this.userService.updateBorrowedBooks(userId); 
  this.userService.borrowedBooks$.subscribe(ids => {
    this.borrowedBooks = ids;
  });
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

loadBorrowedBooks(): void {
    const userId = Number(localStorage.getItem('userId'));
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

  searchBooks(): void {
    const query = this.searchText.trim();
    if (!query) {
      this.filteredBooks = this.books;
      this.aiRecommendations = [];
      return;
    }

    this.loading = true;
    this.userService.searchBooks(query).subscribe({
      next: (recommendations) => {
        this.aiRecommendations = recommendations;

        const recommendedIds = recommendations.map(r => r.id);
        this.filteredBooks = this.books.filter(book => recommendedIds.includes(book.id));

        this.loading = false;
      },
      error: (err) => {
        console.error('Search failed', err);
        this.loading = false;
      }
    });
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
        this.successMessage = 'Book borrowed successfully!';
        alert(' Book borrowed successfully!');
        setTimeout(()=>{this.successMessage = '';}, 3000);
        this.loadBooks();
        this.loadBorrowedBooks();
      },
      error: (err) => {
        console.error('Error borrowing book:', err);
        alert(' Failed to borrow book. Please try again.');
      }
    });
  }
  
  
  
}

