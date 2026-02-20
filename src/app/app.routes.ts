import { Routes } from '@angular/router';

export const routes: Routes = [

  // Default masuk ke login dulu
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Login Page
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then(m => m.LoginPage),
  },

  // Home Page (Dashboard)
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage),
  },

  // Jika route tidak ditemukan
  {
    path: '**',
    redirectTo: 'login',
  }

];
