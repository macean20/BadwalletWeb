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
    <div class="container mt-4">
      <h2 class="mb-4">Historique des Transactions</h2>

      <div class="alert alert-warning" *ngIf="!balanceStore.currentPhone()">
        Veuillez vous connecter via le Dashboard d'abord.
      </div>

      <div class="card shadow-sm" *ngIf="balanceStore.currentPhone()">
        <div class="card-body">
          <div class="text-center my-4" *ngIf="isLoading">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div class="alert alert-info" *ngIf="!isLoading && transactions.length === 0">
            Aucune transaction trouvée.
          </div>

          <div class="table-responsive" *ngIf="!isLoading && transactions.length > 0">
            <table class="table table-striped align-middle">
              <thead class="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Référence</th>
                  <th>Type</th>
                  <th>Destinataire</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of transactions">
                  <td>{{ t.date | date:'short' }}</td>
                  <td><span class="badge bg-secondary">{{ t.reference }}</span></td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-success': t.type === 'DEPOSIT',
                      'bg-danger': t.type === 'WITHDRAWAL',
                      'bg-primary': t.type === 'TRANSFER',
                      'bg-warning text-dark': t.type === 'PAYMENT'
                    }">{{ t.type }}</span>
                  </td>
                  <td>{{ t.destinationPhone || '-' }}</td>
                  <td class="fw-bold" [ngClass]="{'text-danger': t.type !== 'DEPOSIT', 'text-success': t.type === 'DEPOSIT'}">
                    {{ t.type === 'DEPOSIT' ? '+' : '-' }}{{ t.amount | xof }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
