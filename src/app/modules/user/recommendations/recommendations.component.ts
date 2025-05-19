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
  recommendations: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.fetchRecommendations();
  }

  fetchRecommendations(): void {
    
    const userId = 1;  
    this.userService.getRecommendations(userId).subscribe(
      (response: any) => {
        this.recommendations = response;
      },
      (error: any) => {
        console.error('Error fetching recommendations:', error);
      }
    );
  }
  borrowBook(bookId: number): void {
    const userId = 1;
    this.userService.borrowBook(userId, bookId).subscribe({
      next: () => {
        alert('Book borrowed successfully!');
      },
      error: (err) => {
        console.error('Borrow failed:', err);
        alert('Failed to borrow the book.');
      }
    });
  }
}
