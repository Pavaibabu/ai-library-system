import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { BorrowHistoryComponent } from './borrow-history/borrow-history.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { BrowseBooksComponent } from './browse-books/browse-books.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';


const routes: Routes = [
  {
   path: '',
       component: UserDashboardComponent,
       children: [
         { path: 'browse-books', component: BrowseBooksComponent },
         { path: 'borrow-history', component: BorrowHistoryComponent },
         { path: 'user-profile', component:UserProfileComponent },
         { path: 'recommendations', component: RecommendationsComponent },
         { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
         { path: '**', redirectTo: 'dashboard' } //
    ]
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
