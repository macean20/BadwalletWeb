import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  
  // -- Auth Routes (Unsecured) --
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      }
    ]
  },

  // -- Main Routes (Secured) --
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/client/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'transfer',
        loadComponent: () => import('./features/client/transfer/transfer.component').then(m => m.TransferComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/client/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'bills/current',
        loadComponent: () => import('./features/billing/current-bills/current-bills.component').then(m => m.CurrentBillsComponent)
      },
      {
        path: 'admin/wallets',
        loadComponent: () => import('./features/agent/wallet-list/wallet-list.component').then(m => m.WalletListComponent)
      }
    ]
  },
  
  // -- Fallback --
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];
