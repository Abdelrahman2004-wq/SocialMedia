import { Routes } from '@angular/router';
import { Auth } from './layout/auth/auth';
import { Main } from './layout/main/main';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },

 
  // 2. Auth Page Paths Group
  {
    path: 'register',
    component: Auth, // This wraps your register component layout frame
    children: [
      {
        path: '',
        loadComponent: () => import('./core/auth/register/register').then((m) => m.Register),
      }
    ]
  },
  {
    path: 'auth/login',
    component: Auth, // Re-uses the Auth layout frame cleanly for your login screen
    children: [
      {
        path: 'auth/login',
        loadComponent: () => import('./core/auth/login/login').then((m) => m.Login),
      }
    ]
  },
  {
    path: 'forget-password',
    component: Auth,
    children: [
      {
        path: '',
        loadComponent: () => import('./core/auth/forgetpassword/forgetpassword').then((m) => m.Forgetpassword),
      }
    ]
  },

  {
    path: 'app',
    component: Main,
    children: [
      { path: 'feed', loadComponent: () => import('./features/feed/feed').then((m) => m.Feed) },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notification/notification').then((m) => m.Notification),
      },
    ],
  },

  {
    path: '**',
    loadComponent: () => import('./features/notfound/notfound').then((m) => m.Notfound),
  },
];
