import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BalanceStore } from '../../shared/store/balance.store';
import { XofPipe } from '../../shared/pipes/xof.pipe';
import { ToastService } from '../../core/utils/toast.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, XofPipe],
  template: `
    <div class="min-h-screen bg-fintech-light flex flex-col">
      <!-- Top Navigation -->
      <nav class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            
            <div class="flex items-center">
              <div class="flex-shrink-0 flex items-center gap-2 text-fintech-primary font-bold text-xl cursor-pointer" [routerLink]="balanceStore.isAgent() ? '/admin/wallets' : '/dashboard'">
                <div class="h-8 w-8 bg-fintech-primary text-white rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                BadWallet
              </div>
              
              <!-- Desktop Nav (Client) -->
              <div class="hidden sm:ml-8 sm:flex sm:space-x-8" *ngIf="!balanceStore.isAgent()">
                <a routerLink="/dashboard" routerLinkActive="border-fintech-primary text-fintech-dark" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a routerLink="/transfer" routerLinkActive="border-fintech-primary text-fintech-dark" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Transferts
                </a>
                <a routerLink="/bills/current" routerLinkActive="border-fintech-primary text-fintech-dark" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Factures
                </a>
                <a routerLink="/transactions" routerLinkActive="border-fintech-primary text-fintech-dark" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Historique
                </a>
              </div>

              <!-- Desktop Nav (Agent/Admin) -->
              <div class="hidden sm:ml-8 sm:flex sm:space-x-8" *ngIf="balanceStore.isAgent()">
                <a routerLink="/admin/wallets" routerLinkActive="border-fintech-primary text-fintech-dark" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Administration des Portefeuilles
                </a>
              </div>
            </div>

            <!-- Right side (Balance, Profile & Logout) -->
            <div class="flex items-center gap-4">
              <!-- Balance (Client only) -->
              <div class="hidden sm:flex flex-col items-end mr-4" *ngIf="!balanceStore.isAgent()">
                <span class="text-xs text-slate-400">Solde disponible</span>
                <span class="text-sm font-bold text-fintech-dark">
                  {{ balanceStore.balance() !== null ? (balanceStore.balance() | xof) : '0 XOF' }}
                </span>
              </div>
              <!-- Agent indicator -->
              <div class="hidden sm:flex flex-col items-end mr-4 text-emerald-600 font-semibold text-sm" *ngIf="balanceStore.isAgent()">
                Espace Agent 🛡️
              </div>

              <!-- Logout Button -->
              <button (click)="logout()" title="Se déconnecter" class="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class MainLayoutComponent {
  constructor(
    public balanceStore: BalanceStore,
    private router: Router,
    private toastService: ToastService
  ) {}

  logout() {
    this.balanceStore.clear();
    this.toastService.success('Déconnexion réussie !');
    this.router.navigate(['/login']);
  }
}
