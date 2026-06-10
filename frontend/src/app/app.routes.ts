import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'solicitudes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./credit-requests/request-list/request-list.component').then(
        (m) => m.RequestListComponent,
      ),
  },
  { path: '', redirectTo: 'solicitudes', pathMatch: 'full' },
  { path: '**', redirectTo: 'solicitudes' },
];
