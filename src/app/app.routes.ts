import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { RegisterComponent } from './modules/auth/register/register.component';



export const routes: Routes = [
    {path:'',component:HomeComponent},
    {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
    },
    {
        path: 'login',
        loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
    },
    
    { path: 'register', component: RegisterComponent },

    { path: 'about', component: AboutComponent },

      { path: 'register', component: RegisterComponent },
      { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
      { path: 'user', loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule) },
      {
        path: '**',
        redirectTo: ''
      }


];
