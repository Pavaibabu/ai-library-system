import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChangeDetectorRef } from '@angular/core';



interface Book {
  title: string;
  author: string;
}

interface User {
  username: string;
  email: string;
  role: string;
  borrowedBooks: number;
  dueSoon: number;
  returnedBooks: number;
  overdueBooks: number;
}

@Component({
  selector: 'app-user-dashboard',
  imports:[CommonModule,FormsModule,RouterModule,HighchartsChartModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})


export class UserDashboardComponent implements OnInit {

  user: User | null = null;

  // Stats
  borrowedBooks = 0;
  dueSoon = 0;
  returnedBooks = 0;
  overdueBooks = 0;


  recommendedBooks: any[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  constructor(private UserService: UserService,public router: Router,private cdr: ChangeDetectorRef) {}
  
  isMainDashboard(): boolean {
    return this.router.url === '/user';
  }

  recommendations: any[] = [];

ngOnInit(): void {
  const userId = Number(localStorage.getItem('userId'));
  console.log("User ID from localStorage:", userId); 

 
  this.UserService.getUserProfile(userId).subscribe(
    (data: User) => {
      this.user = data;

      // Update stats
      this.borrowedBooks = data.borrowedBooks;
      this.dueSoon = data.dueSoon;
      this.returnedBooks = data.returnedBooks;
      this.overdueBooks = data.overdueBooks;
       setTimeout(() => {
      this.initializeChart();  
    }, 0);

      console.log('User profile loaded:', this.user);
      this.initializeChart();
    },
    (error) => {
      console.error("Error fetching user data", error);
    }
  );

  // Fetch recommendations
  this.UserService.getRecommendations(userId).subscribe(
    (data) => {
      console.log("Recommendations received:", data);
      this.recommendations = data;
    },
    (error) => {
      console.error("Error fetching recommendations", error);
    }
  );
}
initializeChart(): void {
  this.chartOptions = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Borrowing Stats'
    },
    xAxis: {
      categories: ['Borrowed', 'Due Soon', 'Returned', 'Overdue'],
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Count'
      }
    },
    tooltip: {
      shared: true
    },
    series: [
      {
        name: 'Books',
        type: 'column',
        data: [
          this.borrowedBooks ?? 0,
          this.dueSoon ?? 0,
          this.returnedBooks ?? 0,
          this.overdueBooks ?? 0
        ],
        colorByPoint: true
      }
    ],
    accessibility: {
      enabled: false
    }
  };
  this.cdr.detectChanges(); 
}

 


borrowBook(book: any): void {
  console.log('Borrowing book:', book.title);
}

logout(): void {
  console.log('Logging out...');
  localStorage.clear(); 
  this.router.navigate(['/']);
}
}
 