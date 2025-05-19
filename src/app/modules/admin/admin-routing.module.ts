import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageBooksComponent } from './manage-books/manage-books.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'manage-books', component: ManageBooksComponent },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' } // Wildcard route to redirect to dashboard
    ],
    }
  
    // // path: '',
    // // component: AdminDashboardComponent,
    // // children: [
    //   { path: '/admin/dashboard', component: AdminDashboardComponent },
    // //   { path: 'manage-books', component: ManageBooksComponent },
    // //   { path: 'manage-users', component: ManageUsersComponent },
    //   // { path: '', redirectTo: '/admin/manage-books', pathMatch: 'full' },
    //   // { path: '**', redirectTo: '/admin/manage-books' } ,
    // // ]
    //   { path: '', component: ManageBooksComponent },
    //   { path: 'manage-users', component: ManageUsersComponent } ,

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {  }
