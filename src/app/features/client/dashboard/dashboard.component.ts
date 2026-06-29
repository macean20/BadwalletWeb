import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BalanceStore } from '../../../shared/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, XofPipe, CardComponent, ButtonComponent],
  template: `
    <div class="container mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-fintech-dark">Tableau de Bord</h2>
          <p class="text-slate-500 text-sm mt-1">Bienvenue sur votre espace BadWallet</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" *ngIf="balanceStore.currentPhone()">
        
        <!-- Balance Card -->
        <app-card>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-50 text-fintech-primary rounded-xl">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-slate-700">Solde Actuel</h3>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              En direct
            </span>
          </div>
          <div class="mt-4">
            <h2 class="text-4xl font-extrabold text-fintech-dark tracking-tight">
              {{ balanceStore.balance() | xof }}
            </h2>
          </div>
        </app-card>
        
        <!-- Quick Actions Card -->
        <app-card title="Actions Rapides">
          <div class="grid grid-cols-2 gap-4 mt-2">
            <app-button variant="primary" (click)="goTo('/transfer')">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              Transfert
            </app-button>
            <app-button variant="outline" (click)="goTo('/bills/current')">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Factures
            </app-button>
          </div>
        </app-card>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  constructor(
    public balanceStore: BalanceStore,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.balanceStore.currentPhone()) {
      this.balanceStore.refresh();
    }
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
