import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';



@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-books.component.html'
})
export class ManageBooksComponent {
  isAddBookVisible = false;
  isEditMode = false;
  books: any[] = [];
  filteredBooks: any[] = [];
  successMessage: string = '';
  statuses = ['All', 'Available', 'Lost', 'Damaged'];
  selectedStatus = 'All';
  genres: string[] = ['Fiction', 'Non-Fiction', 'Science', 'Fantasy', 'Mystery', 'Biography', 'Romance'];
 

  book = {
    id: 0,
    title: '',
    author: '',
    genre: '',
    year: null,
    status: 'Available'
  };


  constructor(private adminService: AdminService) {
    this.loadBooks();
  }


filterBooksByStatus(status: string): void {
  this.selectedStatus = status;
  if (status === 'All') {
    this.filteredBooks = this.books;
  } else {
    this.filteredBooks = this.books.filter(book => book.status === status);
  }
}

  openAddBookCard() {
    this.isAddBookVisible = true;
    this.isEditMode = false;
    this.resetForm();
  }

  closeAddBookCard() {
    this.isAddBookVisible = false;
    this.resetForm();
  }
  submitBookForm() {
    if (this.isEditMode) {
      this.updateBook();
    } else {
      this.addBook();
    }
  }

  addBook() {
    if (this.isEditMode) {
      this.adminService.updateBook(this.book).subscribe({
        next: () => {
          this.successMessage = ' Book updated successfully!';
          this.closeAddBookCard();
          this.loadBooks();
          setTimeout(() => this.successMessage = '', 3000); 
        },
        error: (err) => {
          console.error('Error updating book:', err);
          alert('Failed to update book.');
        }
      });
    } else {
      this.adminService.addBook(this.book).subscribe({
        next: () => {
          this.successMessage = ' Book added successfully!';
          this.closeAddBookCard();
          this.loadBooks();
          setTimeout(() => this.successMessage = '', 3000); 
        },
        error: (err) => {
          console.error('Error adding book:', err);
          alert('Failed to add book.');
        }
      });
    }
  }


  loadBooks() {
    this.adminService.getAllBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = data; 
      },
      error: (err) => console.error('Failed to load books:', err)
    });
  }

  updateBook() {
    this.adminService.updateBook(this.book).subscribe({
      next: (res) => {
        console.log(' Update success:', res);
        this.successMessage = res.message || 'Book updated successfully!';
        this.closeAddBookCard();    
        this.loadBooks();            
        setTimeout(() => this.successMessage = '', 3000); 
      },
      error: (err) => {
        console.error(' Update error:', err);
        alert('Failed to update book.');
      }
    });
  }
  editBook(bookToEdit: any) {
    this.isEditMode = true;
    this.book = { ...bookToEdit };
    this.isAddBookVisible = true;
  }

  deleteBook(book: any) {
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      this.adminService.deleteBook(book.id).subscribe({
        next: () => {
          alert('Book deleted successfully!');
          this.loadBooks();
        },
        error: (err) => {
          console.error('Error deleting book:', err);
          alert('Failed to delete book.');
        }
      });
    }
  }

  resetForm() {
    this.book = {
      id: 0,
      title: '',
      author: '',
      genre: '',
      year: null,
      status: 'Available'
    };
  }

}

 
  

