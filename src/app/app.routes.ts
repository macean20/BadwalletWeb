import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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
];
