import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    XofPipe,
    CardComponent,
    ButtonComponent,
    SkeletonComponent,
    ModalComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-fintech-dark">Administration des Portefeuilles</h2>
          <p class="text-slate-500 text-sm mt-1">Espace Agent - Gestion globale des comptes clients.</p>
        </div>
        <app-button variant="primary" (click)="openCreateModal()">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Client
        </app-button>
      </div>

      <!-- Main Card -->
      <app-card>
        
        <!-- Search Bar and Filter info -->
        <div class="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div class="relative w-full md:w-1/2 flex gap-2">
            <input type="text" [(ngModel)]="searchPhone" (keyup.enter)="searchClient()" placeholder="Rechercher par n° de téléphone (ex: +221770000001)"
              class="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-fintech-primary focus:border-fintech-primary font-medium text-fintech-dark text-sm">
            <app-button variant="primary" (click)="searchClient()" [loading]="isSearching">
              Rechercher
            </app-button>
            <app-button *ngIf="isFiltered" variant="secondary" (click)="clearSearch()">
              Réinitialiser
            </app-button>
          </div>
          <div class="text-sm text-slate-500" *ngIf="isFiltered">
            <span class="font-bold text-fintech-primary">Résultat de recherche actif</span>
          </div>
        </div>

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
                      {{ w.phoneNumber.substring(Math.max(0, w.phoneNumber.length - 2)) || 'CL' }}
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
              <tr *ngIf="pageData.content.length === 0">
                <td colspan="4" class="px-6 py-10 text-center text-slate-400">
                  Aucun portefeuille trouvé.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6 mt-4" *ngIf="!isLoading && pageData && !isFiltered">
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

    <!-- Modal Création Portefeuille -->
    <app-modal #createModal title="Créer un nouveau client / portefeuille" [hasFooter]="true">
      <form [formGroup]="createForm" class="space-y-4">
        
        <!-- Téléphone -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Téléphone (Format: +221...)</label>
          <input type="text" formControlName="phoneNumber" placeholder="Ex: +221770000000"
            class="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-fintech-primary focus:border-fintech-primary font-semibold text-fintech-dark transition-colors">
          <div *ngIf="createForm.get('phoneNumber')?.touched && createForm.get('phoneNumber')?.invalid" class="text-xs text-red-500 mt-1">
            Le numéro de téléphone est requis et doit être au format valide (ex: +221770000000).
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
          <input type="email" formControlName="email" placeholder="client@domaine.com"
            class="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-fintech-primary focus:border-fintech-primary font-semibold text-fintech-dark transition-colors">
          <div *ngIf="createForm.get('email')?.touched && createForm.get('email')?.invalid" class="text-xs text-red-500 mt-1">
            Veuillez entrer une adresse email valide.
          </div>
        </div>

        <!-- Solde Initial -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Solde Initial (XOF)</label>
          <input type="number" formControlName="initialBalance"
            class="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-fintech-primary focus:border-fintech-primary font-semibold text-fintech-dark transition-colors">
          <div *ngIf="createForm.get('initialBalance')?.touched && createForm.get('initialBalance')?.invalid" class="text-xs text-red-500 mt-1">
            Le solde initial doit être supérieur ou égal à 0.
          </div>
        </div>

        <!-- Code Wallet & Devise -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Code Portefeuille</label>
            <input type="text" formControlName="code"
              class="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-fintech-primary focus:border-fintech-primary font-mono font-semibold text-fintech-dark transition-colors">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Devise</label>
            <input type="text" formControlName="currency" readonly
              class="block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-400 font-bold rounded-xl transition-colors">
          </div>
        </div>

      </form>

      <div modal-footer class="w-full flex justify-end gap-3">
        <app-button variant="secondary" (click)="closeCreateModal()">Annuler</app-button>
        <app-button variant="primary" [loading]="isCreating" [disabled]="createForm.invalid" (click)="submitCreateWallet()">
          Créer le portefeuille
        </app-button>
      </div>
    </app-modal>
  `
})
export class WalletListComponent implements OnInit {
  @ViewChild('operationModal') operationModal!: ModalComponent;
  @ViewChild('createModal') createModal!: ModalComponent;

  // Global state
  Math = Math;
  pageData: PageResponse<WalletDto> | null = null;
  currentPage = 0;
  pageSize = 10;
  isLoading = false;

  // Search State
  searchPhone = '';
  isSearching = false;
  isFiltered = false;

  // Operation Modal State
  selectedWallet: WalletDto | null = null;
  operationType: 'DEPOSIT' | 'WITHDRAWAL' = 'DEPOSIT';
  operationAmount: number | null = null;
  isOperating = false;

  // Create Modal State
  createForm: FormGroup;
  isCreating = false;

  constructor(
    private api: WalletApiService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      code: ['', [Validators.required]],
      currency: ['XOF', [Validators.required]]
    });
  }

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

  // Search Logic
  searchClient() {
    if (!this.searchPhone) {
      this.toast.info('Veuillez saisir un numéro de téléphone.');
      return;
    }
    this.isSearching = true;
    this.api.getWallet(this.searchPhone).subscribe({
      next: (wallet) => {
        this.isSearching = false;
        this.pageData = {
          content: [wallet],
          totalElements: 1,
          totalPages: 1
        };
        this.isFiltered = true;
      },
      error: (err) => {
        this.isSearching = false;
        this.toast.error(err.error?.message || 'Aucun portefeuille trouvé pour ce numéro.');
      }
    });
  }

  clearSearch() {
    this.searchPhone = '';
    this.isFiltered = false;
    this.loadPage(0);
  }

  // Deposit/Withdrawal Modal Logic
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
        if (this.isFiltered) {
          // If searching, reload searched wallet to update balance
          this.api.getWallet(phone).subscribe({
            next: (w) => {
              this.pageData = {
                content: [w],
                totalElements: 1,
                totalPages: 1
              };
            }
          });
        } else {
          this.loadPage(this.currentPage); // Refresh list
        }
      },
      error: (err) => {
        this.isOperating = false;
        this.toast.error(err.error?.message || "Erreur lors de l'opération.");
      }
    });
  }

  // Create Wallet Logic
  openCreateModal() {
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
    this.createForm.patchValue({
      phoneNumber: '+22177',
      email: '',
      initialBalance: 0,
      code: `WLT-${randomSuffix}`,
      currency: 'XOF'
    });
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
    this.createModal.open();
  }

  closeCreateModal() {
    this.createModal.close();
  }

  submitCreateWallet() {
    if (this.createForm.invalid) return;

    this.isCreating = true;
    const payload = this.createForm.value;

    this.api.createWallet(payload).subscribe({
      next: (res) => {
        this.isCreating = false;
        this.toast.success(`Portefeuille créé avec succès pour ${res.phoneNumber} !`);
        this.closeCreateModal();
        this.loadPage(this.currentPage); // Refresh list
      },
      error: (err) => {
        this.isCreating = false;
        this.toast.error(err.error?.message || 'Erreur lors de la création du portefeuille.');
      }
    });
  }
}
