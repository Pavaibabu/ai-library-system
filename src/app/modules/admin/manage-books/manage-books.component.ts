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
  statuses = ['All', 'Available', 'Borrowed', 'Damaged'];
  selectedStatus = 'All';
  genres: string[] = ['Fiction', 'Non-Fiction', 'Science', 'Fantasy', 'Mystery', 'Biography', 'Romance'];
  searchTerm:string=''; 

  book = {
    id: 0,
    title: '',
    author: '',
    genre: '',
    year: null,
    status: 'Available',
    copies: 1 
  };
  
  constructor(private adminService: AdminService) {
    this.loadBooks();
  }

  formatBookId(id: number): string {
    return 'BOOK' + id.toString().padStart(2, '0');
    }
  
  loadBooks() {
    this.adminService.getAllBooks().subscribe({
      next: (data) => {
        this.books = data.map(book => ({
          ...book,
          status: book.status && book.status.trim() !== '' ? book.status : 'Borrowed'
        }));
        this.filterBooksByStatus(this.selectedStatus);
      },
      error: (err) => console.error('Failed to load books:', err)
    });
  
  }


  filterBooksByStatus(status: string): void {
    this.selectedStatus = status;
    if (status === 'All') {
      this.filteredBooks = this.books;
    } else {
      this.filteredBooks = this.books.filter(book => book.status === status);
    }
  }
 searchBooks(): void {
    const term = this.searchTerm.toLowerCase();

     this.filteredBooks = this.books.filter(book =>
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.genre?.toLowerCase().includes(term)
    );
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
      this.addBook();
  }

  addBook() {
    if (this.isEditMode) {
      this.adminService.updateBook(this.book).subscribe({
        next: () => {
          alert('Book Updated Successfully!');
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
          alert('Book added successfully!');
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

  exportToCSV():void{
    const headers = ['ID', 'Title', 'Author', 'Genre', 'Year', 'Status', 'Copies'];
    const rows = this.filteredBooks.map(book => [
      book.id,
      book.title,
      book.author,
      book.genre,
      book.year,
      book.status,
      book.copies
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';

    rows.forEach(row =>{
      csvContent+=row.join(',')+'\n';
    })
    const encodeUri=encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href',encodeUri);
    link.setAttribute('download', 'books.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

editBook(bookToEdit: any) {
    this.isEditMode = true;
    this.book = { ...bookToEdit };
    this.isAddBookVisible = true;
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
  
 deleteBook(book: any) {
  if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
   this.adminService.deleteBook(book.id).subscribe({
  next: (res) => {
    this.successMessage = res.message;
    this.loadBooks();
    setTimeout(() => this.successMessage = '', 3000);
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
      status: 'Available',
      copies: 1  
    };
  }

}

