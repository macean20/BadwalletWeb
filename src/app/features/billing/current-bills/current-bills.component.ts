import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingApiService, FactureDto } from '../../../core/services/billing-api.service';
import { BalanceStore } from '../../../shared/store/balance.store';
import { ToastService } from '../../../core/utils/toast.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/components/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-current-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe, CardComponent, ButtonComponent, SkeletonComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-fintech-dark">Paiement de Factures</h2>
          <p class="text-slate-500 text-sm mt-1">Réglez vos factures impayées en un clic.</p>
        </div>
      </div>

      <!-- Filters & Actions -->
      <app-card>
        <div class="flex flex-col sm:flex-row items-end gap-4">
          <div class="flex-1 w-full">
            <label class="block text-sm font-medium text-slate-700 mb-2">Sélectionner le service (Biller)</label>
            <select class="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-fintech-primary focus:border-fintech-primary sm:text-sm rounded-xl border bg-slate-50"
                    [(ngModel)]="selectedService" (change)="loadBills()">
              <option value="SENELEC">SENELEC</option>
              <option value="WOYAFAL">WOYAFAL</option>
              <option value="ISM">ISM (Scolarité)</option>
              <option value="SONATEL">SONATEL</option>
            </select>
          </div>
          <div class="w-full sm:w-auto">
            <app-button variant="secondary" (click)="loadBills()" [loading]="isLoading">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </app-button>
          </div>
        </div>
      </app-card>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="space-y-4">
        <app-skeleton *ngFor="let i of [1,2]" heightClass="h-24"></app-skeleton>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && factures.length === 0" class="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
        <div class="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-fintech-dark">Aucune facture impayée</h3>
        <p class="mt-1 text-slate-500">Vous êtes à jour avec {{ selectedService }}.</p>
      </div>

      <!-- Factures List -->
      <div *ngIf="!isLoading && factures.length > 0" class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <ul class="divide-y divide-slate-100">
          <li *ngFor="let f of factures" class="p-4 hover:bg-slate-50 transition-colors cursor-pointer" (click)="toggleSelection(f.reference)">
            <div class="flex items-center">
              
              <!-- Checkbox -->
              <div class="flex-shrink-0 mr-4">
                <div class="w-6 h-6 rounded border flex items-center justify-center transition-colors"
                     [ngClass]="selectedRefs.has(f.reference) ? 'bg-fintech-primary border-fintech-primary' : 'border-slate-300 bg-white'">
                  <svg *ngIf="selectedRefs.has(f.reference)" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-fintech-dark truncate">
                  Facture {{ f.serviceName }}
                </p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                    Réf: {{ f.reference }}
                  </span>
                  <span class="text-xs text-slate-500">
                    Échéance: {{ f.dueDate | date:'mediumDate' }}
                  </span>
                </div>
              </div>

              <!-- Amount -->
              <div class="ml-4 flex-shrink-0 text-right">
                <p class="text-lg font-bold text-fintech-dark">{{ f.amount | xof }}</p>
              </div>

            </div>
          </li>
        </ul>
        
        <!-- Summary & Action Footer -->
        <div class="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500">Total sélectionné ({{ selectedRefs.size }} factures)</p>
            <p class="text-2xl font-extrabold text-fintech-dark">{{ getTotalSelected() | xof }}</p>
          </div>
          <app-button variant="primary" (click)="paySelected()" [disabled]="selectedRefs.size === 0" [loading]="isPaying" class="w-full sm:w-auto">
            Procéder au paiement
          </app-button>
        </div>
      </div>

    </div>
  `
})
export class CurrentBillsComponent implements OnInit {
  selectedService = 'SENELEC';
  factures: FactureDto[] = [];
  selectedRefs: Set<string> = new Set();
  
  isLoading = false;
  isPaying = false;

  constructor(
    private api: BillingApiService,
    public balanceStore: BalanceStore,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    if (this.balanceStore.currentPhone()) {
      this.loadBills();
    }
  }

  loadBills() {
    const phone = this.balanceStore.currentPhone();
    if (!phone) return;

    this.isLoading = true;
    this.selectedRefs.clear();

    // The backend uses exact code mapping for mock data (e.g. WLT-0000003), 
    // but the API accepts phone number.
    this.api.getCurrentBills(phone, this.selectedService).subscribe({
      next: (data) => {
        this.factures = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.factures = [];
        // Optional: show toast only if it's not a generic 404 (Not Found / no bills)
      }
    });
  }

  toggleSelection(ref: string) {
    if (this.selectedRefs.has(ref)) {
      this.selectedRefs.delete(ref);
    } else {
      this.selectedRefs.add(ref);
    }
  }

  getTotalSelected(): number {
    return this.factures
      .filter(f => this.selectedRefs.has(f.reference))
      .reduce((sum, f) => sum + f.amount, 0);
  }

  paySelected() {
    const phone = this.balanceStore.currentPhone();
    if (!phone || this.selectedRefs.size === 0) return;

    this.isPaying = true;

    const payload = {
      phoneNumber: phone,
      serviceName: this.selectedService,
      factureReferences: Array.from(this.selectedRefs)
    };

    this.api.payBills(payload).subscribe({
      next: (res: any) => {
        this.isPaying = false;
        this.toast.success(`Paiement de ${this.selectedRefs.size} facture(s) réussi ! Réf: ${res.reference}`);
        this.balanceStore.refresh();
        this.loadBills(); // Recharger pour enlever les factures payées de la liste
      },
      error: () => {
        // L'erreur est gérée globalement par le HttpErrorInterceptor (Affiche un Toast d'erreur)
        this.isPaying = false;
      }
    });
  }
}
