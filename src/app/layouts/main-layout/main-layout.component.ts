import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BalanceStore } from '../../shared/store/balance.store';
import { XofPipe } from '../../shared/pipes/xof.pipe';

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
              <div class="flex-shrink-0 flex items-center gap-2 text-fintech-primary font-bold text-xl cursor-pointer" routerLink="/dashboard">
                <div class="h-8 w-8 bg-fintech-primary text-white rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                BadWallet
              </div>
              
              <!-- Desktop Nav -->
              <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
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
            </div>

            <!-- Right side (Balance & Profile) -->
            <div class="flex items-center gap-4">
              <div class="hidden sm:flex flex-col items-end mr-4">
                <span class="text-xs text-slate-400">Solde disponible</span>
                <span class="text-sm font-bold text-fintech-dark">
                  {{ balanceStore.balance() !== null ? (balanceStore.balance() | xof) : '0 XOF' }}
                </span>
              </div>
              <div class="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300 cursor-pointer hover:bg-slate-300 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
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
  constructor(public balanceStore: BalanceStore) {}
}
