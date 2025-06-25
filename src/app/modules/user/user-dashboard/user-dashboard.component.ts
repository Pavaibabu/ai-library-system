import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChangeDetectorRef } from '@angular/core';
import { chatbotComponent } from '../chatbot/chatbot.component';

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
  imports:[CommonModule,FormsModule,RouterModule,HighchartsChartModule,chatbotComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})


export class UserDashboardComponent implements OnInit {

  user: User | null = null;
  showLogoutAlert = false;
  borrowedBooks = 0;
  dueSoon = 0;
  returnedBooks = 0;
  overdueBooks = 0;
  recommendations: any[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  constructor(private UserService: UserService,public router: Router,public cdr:ChangeDetectorRef) {}
  
  isMainDashboard(): boolean {
    return this.router.url === '/user';
  }

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));
    console.log("User ID from localStorage:", userId); 

    this.UserService.getUserProfile(userId).subscribe(
      (data: User) => {
        this.user = data;
      },
      (error) => {
        console.error("Error fetching user data", error);
      }
    );

  
  this.UserService.getBorrowHistory(userId).subscribe(
    (books: any[]) => {
      const today = new Date();
      this.borrowedBooks = books.length;
      this.returnedBooks = books.filter(b => b.status === 'Returned').length;
      this.dueSoon = books.filter(b => {
        const dueDate = new Date(b.dueDate);
        const diffDays = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
        return b.status !== 'Returned' && diffDays > 0 && diffDays <= 3;
      }).length;

      this.overdueBooks = books.filter(b => {
        const dueDate = new Date(b.dueDate);
        return b.status !== 'Returned' && dueDate < today;
      }).length;

      console.log("Borrowed:", this.borrowedBooks, "Returned:", this.returnedBooks, "Due Soon:", this.dueSoon, "Overdue:", this.overdueBooks);
      this.initializeChart();
      },
      (error) => {
        console.error("Error fetching borrow history", error);
      }
  );

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
  console.log("Chart Data:", [this.borrowedBooks, this.dueSoon, this.returnedBooks, this.overdueBooks]);

}

  logout(): void {
    const confirmed = confirm('Are you sure you want to logout?');

    if (confirmed) {
      localStorage.clear();
      this.showLogoutAlert = true;
      setTimeout(() => {
        this.showLogoutAlert = false;
        this.router.navigate(['/']);
      }, 1000);
    }
  }
}
 