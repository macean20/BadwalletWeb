import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletApiService, WalletDto, PageResponse } from '../../../core/services/wallet-api.service';
import { ToastService } from '../../../core/utils/toast.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/components/ui/skeleton/skeleton.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe, CardComponent, ButtonComponent, SkeletonComponent, ModalComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-fintech-dark">Administration des Portefeuilles</h2>
          <p class="text-slate-500 text-sm mt-1">Espace Agent - Gestion globale des comptes clients.</p>
        </div>
        <app-button variant="primary">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Client
        </app-button>
      </div>

      <!-- Main Card -->
      <app-card>
        
        <!-- Loading State -->
        <div *ngIf="isLoading" class="space-y-4">
          <app-skeleton *ngFor="let i of [1,2,3,4,5]" heightClass="h-16"></app-skeleton>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto" *ngIf="!isLoading && pageData">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Identifiants</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Solde Actuel</th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Opérations (Guichet)</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-100">
              <tr *ngFor="let w of pageData.content" class="hover:bg-slate-50 transition-colors">
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-fintech-primary text-white flex items-center justify-center font-bold">
                      {{ w.phoneNumber.substring(4, 6) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-fintech-dark">{{ w.phoneNumber }}</div>
                      <div class="text-sm text-slate-500">{{ w.email }}</div>
                    </div>
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 font-mono">
                    {{ w.code }}
                  </span>
                  <div class="text-xs text-slate-400 mt-1">ID: #{{ w.id }}</div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-bold" [ngClass]="(w.balance || 0) > 0 ? 'text-emerald-600' : 'text-slate-400'">
                    {{ w.balance | xof }}
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-center space-x-2">
                  <button class="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          (click)="openModal(w, 'DEPOSIT')">
                    Dépôt
                  </button>
                  <button class="text-fintech-primary hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          (click)="openModal(w, 'WITHDRAWAL')">
                    Retrait
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6 mt-4" *ngIf="!isLoading && pageData">
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-slate-700">
                Page <span class="font-medium">{{ currentPage + 1 }}</span> sur <span class="font-medium">{{ pageData.totalPages }}</span>
                (Total: {{ pageData.totalElements }} portefeuilles)
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button [disabled]="currentPage === 0" (click)="loadPage(currentPage - 1)"
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Précédent
                </button>
                <button [disabled]="currentPage >= pageData.totalPages - 1" (click)="loadPage(currentPage + 1)"
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>

      </app-card>
    </div>

    <!-- Modal Dépôt / Retrait -->
    <app-modal #operationModal [title]="operationType === 'DEPOSIT' ? 'Effectuer un dépôt' : 'Effectuer un retrait'" [hasFooter]="true">
      <div *ngIf="selectedWallet">
        <div class="p-4 bg-slate-50 rounded-xl mb-6">
          <p class="text-sm text-slate-500">Client ciblé</p>
          <p class="font-bold text-fintech-dark">{{ selectedWallet.phoneNumber }}</p>
          <p class="text-xs text-slate-400 mt-1">Solde actuel: {{ selectedWallet.balance | xof }}</p>
        </div>

        <label class="block text-sm font-medium text-slate-700 mb-2">Montant (XOF)</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-slate-500 font-bold">XOF</span>
          </div>
          <input type="number" [(ngModel)]="operationAmount" placeholder="Ex: 5000"
            class="block w-full pl-12 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-fintech-primary focus:border-fintech-primary font-bold text-fintech-dark transition-colors">
        </div>
      </div>
      
      <div modal-footer class="w-full flex justify-end gap-3">
        <app-button variant="secondary" (click)="closeModal()">Annuler</app-button>
        <app-button [variant]="operationType === 'DEPOSIT' ? 'primary' : 'danger'" 
                    [loading]="isOperating" 
                    [disabled]="!operationAmount || operationAmount <= 0"
                    (click)="submitOperation()">
          Confirmer le {{ operationType === 'DEPOSIT' ? 'dépôt' : 'retrait' }}
        </app-button>
      </div>
    </app-modal>
  `
})
export class WalletListComponent implements OnInit {
  @ViewChild('operationModal') operationModal!: ModalComponent;

  pageData: PageResponse<WalletDto> | null = null;
  currentPage = 0;
  pageSize = 10;
  isLoading = false;

  // Modal State
  selectedWallet: WalletDto | null = null;
  operationType: 'DEPOSIT' | 'WITHDRAWAL' = 'DEPOSIT';
  operationAmount: number | null = null;
  isOperating = false;

  constructor(
    private api: WalletApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number) {
    this.isLoading = true;
    this.currentPage = page;
    this.api.getWallets(page, this.pageSize).subscribe({
      next: (data) => {
        this.pageData = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openModal(wallet: WalletDto, type: 'DEPOSIT' | 'WITHDRAWAL') {
    this.selectedWallet = wallet;
    this.operationType = type;
    this.operationAmount = null;
    this.operationModal.open();
  }

  closeModal() {
    this.operationModal.close();
    this.selectedWallet = null;
  }

  submitOperation() {
    if (!this.selectedWallet || !this.selectedWallet.id || !this.operationAmount) return;

    this.isOperating = true;
    const id = this.selectedWallet.id;
    const phone = this.selectedWallet.phoneNumber;
    const amount = this.operationAmount;

    const request$ = this.operationType === 'DEPOSIT' 
      ? this.api.deposit(id, { amount, paymentMethod: 'GUICHET' }) 
      : this.api.withdraw({ phoneNumber: phone, amount });

    request$.subscribe({
      next: (res: any) => {
        this.isOperating = false;
        this.toast.success(`Opération réussie ! Réf: ${res.reference}`);
        this.closeModal();
        this.loadPage(this.currentPage); // Refresh list
      },
      error: () => {
        this.isOperating = false;
      }
    });
  }
}
