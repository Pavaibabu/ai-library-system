import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { RouterModule } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { BorrowHistoryComponent } from './borrow-history/borrow-history.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { BrowseBooksComponent } from './browse-books/browse-books.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';


@NgModule({
  imports: [
    CommonModule,FormsModule,
    UserRoutingModule,RouterModule,ReactiveFormsModule,HighchartsChartModule,UserDashboardComponent,BrowseBooksComponent,BorrowHistoryComponent,UserProfileComponent,
  
  ]
})
export class UserModule { }
