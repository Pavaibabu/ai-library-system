import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, CommonModule,RouterModule,HighchartsChartModule],
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent {
  totalBooks: number = 0;
  totalUsers: number = 0;
  booksBorrowed: number = 0;
  overdue: number = 0;
  books: any[] = [];
  filteredBooks: any[] = [];
  Highcharts: typeof Highcharts = Highcharts;
chartOptions!: Highcharts.Options;
updateFlag: boolean = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchDashboardStats();
    this.getAllBooks();
  }

  fetchDashboardStats(): void {
  this.adminService.getDashboardStats().subscribe({
    next: (data) => {
      this.totalBooks = data.totalBooks;
      this.totalUsers = data.totalUsers;
      this.booksBorrowed = data.borrowedBooks ?? 0; 
      this.overdue = data.overdueBooks ?? 0;         

      console.log("Chart Data:", {
        totalBooks: this.totalBooks,
        totalUsers: this.totalUsers,
        booksBorrowed: this.booksBorrowed,
        overdue: this.overdue
      });

      this.chartOptions = {
        accessibility: { enabled: false }, 
        chart: {
          type: 'column'
        },
        title: {
          text: 'Library Activity Overview'
        },
        xAxis: {
          categories: ['Books', 'Users', 'Borrowed', 'Overdue'],
          crosshair: true
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Count'
          }
        },
        tooltip: {
          shared: true,
          useHTML: true
        },
        plotOptions: {
          column: {
            borderRadius: 5,
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        series: [{
          name: 'Stats',
          type: 'column',
          data: [
            this.totalBooks,
            this.totalUsers,
            this.booksBorrowed,
            this.overdue
          ],
          colorByPoint: true
        }]
      };

      this.updateFlag = true;
    },
    error: (err) => {
      console.error('Error fetching dashboard stats:', err);
    }
  });
}

  getAllBooks(): void {
    this.adminService.getAllBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = data;
      },
      error: (err) => {
        console.error('Error fetching books:', err);
      }
    });
  }

 
  logout(){
    console.log("Logging out..");
  }

 
}
