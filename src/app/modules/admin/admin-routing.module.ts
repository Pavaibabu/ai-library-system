import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageBooksComponent } from './manage-books/manage-books.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { UserHistoryComponent } from './user-history/user-history.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'manage-books', component: ManageBooksComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'user-history/:id', component: UserHistoryComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' } 
    ],
    }
  
   
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {  }
