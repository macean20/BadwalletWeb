import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletApiService, TransactionDto } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../shared/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, XofPipe],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-fintech-dark">Historique des Transactions</h2>
          <p class="text-slate-500 text-sm mt-1">Consultez et suivez toutes vos opérations financières.</p>
        </div>
      </div>

      <div class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3" *ngIf="!balanceStore.currentPhone()">
        <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm font-medium">Veuillez vous connecter via le Dashboard d'abord.</span>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" *ngIf="balanceStore.currentPhone()">
        
        <!-- Loading -->
        <div class="p-8 text-center" *ngIf="isLoading">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-fintech-primary mb-4"></div>
          <p class="text-slate-500 font-medium">Chargement de l'historique...</p>
        </div>

        <!-- Empty State -->
        <div class="p-12 text-center" *ngIf="!isLoading && transactions.length === 0">
          <div class="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-fintech-dark">Aucune transaction trouvée</h3>
          <p class="mt-1 text-slate-500">Votre historique d'opérations est vide pour le moment.</p>
        </div>

        <!-- Transactions Table -->
        <div class="overflow-x-auto" *ngIf="!isLoading && transactions.length > 0">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type / Référence</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Destinataire / Source</th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-100">
              <tr *ngFor="let t of transactions" class="hover:bg-slate-50 transition-colors">
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-fintech-dark">{{ t.date | date:'dd MMM yyyy' }}</div>
                  <div class="text-xs text-slate-400">{{ t.date | date:'HH:mm' }}</div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': t.type === 'DEPOSIT',
                          'bg-red-100 text-red-800': t.type === 'WITHDRAWAL',
                          'bg-blue-100 text-blue-800': t.type === 'TRANSFER',
                          'bg-amber-100 text-amber-800': t.type === 'PAYMENT'
                        }">
                    {{ t.type }}
                  </span>
                  <div class="text-xs text-slate-400 mt-1 font-mono">Ref: {{ t.reference }}</div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-700 font-medium">
                    {{ t.destinationPhone || 'N/A' }}
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-bold" 
                       [ngClass]="{'text-red-600': t.type !== 'DEPOSIT', 'text-emerald-600': t.type === 'DEPOSIT'}">
                    {{ t.type === 'DEPOSIT' ? '+' : '-' }}{{ t.amount | xof }}
                  </div>
                </td>
                
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  transactions: TransactionDto[] = [];
  isLoading = false;

  constructor(private api: WalletApiService, public balanceStore: BalanceStore) {}

  ngOnInit(): void {
    if (this.balanceStore.currentPhone()) {
      this.loadHistory();
    }
  }

  loadHistory() {
    const phone = this.balanceStore.currentPhone();
    if (!phone) return;

    this.isLoading = true;
    this.api.getTransactions(phone).subscribe({
      next: (data) => {
        this.transactions = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
