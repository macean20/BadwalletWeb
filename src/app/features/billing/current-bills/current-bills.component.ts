import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingApiService, FactureDto } from '../../../core/services/billing-api.service';
import { BalanceStore } from '../../../shared/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-current-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, XofPipe],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Mes Factures Impayées</h2>

      <div class="alert alert-warning" *ngIf="!balanceStore.currentPhone()">
        Veuillez vous connecter via le Dashboard d'abord.
      </div>

      <div class="card shadow-sm mb-4" *ngIf="balanceStore.currentPhone()">
        <div class="card-body">
          <div class="row align-items-end mb-3">
            <div class="col-md-4">
              <label class="form-label">Fournisseur (Unité)</label>
              <select class="form-select" [(ngModel)]="selectedService" (change)="loadBills()">
                <option value="SENELEC">SENELEC</option>
                <option value="WOYAFAL">WOYAFAL</option>
                <option value="ISM">ISM</option>
                <option value="SONATEL">SONATEL</option>
              </select>
            </div>
            <div class="col-md-4">
              <button class="btn btn-primary" (click)="loadBills()" [disabled]="isLoading">
                <i class="bi bi-arrow-clockwise"></i> Actualiser
              </button>
            </div>
          </div>

          <div class="text-center my-4" *ngIf="isLoading">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div class="alert alert-info" *ngIf="!isLoading && factures.length === 0">
            Aucune facture impayée trouvée pour {{ selectedService }}.
          </div>

          <div class="table-responsive" *ngIf="!isLoading && factures.length > 0">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Sélection</th>
                  <th>Référence</th>
                  <th>Service</th>
                  <th>Échéance</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of factures">
                  <td>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" 
                             [checked]="selectedRefs.has(f.reference)"
                             (change)="toggleSelection(f.reference)">
                    </div>
                  </td>
                  <td><span class="badge bg-secondary">{{ f.reference }}</span></td>
                  <td>{{ f.serviceName }}</td>
                  <td>{{ f.dueDate }}</td>
                  <td class="fw-bold">{{ f.amount | xof }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-end fw-bold">Total Sélectionné :</td>
                  <td class="fw-bold text-primary">{{ getTotalSelected() | xof }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="alert alert-danger mt-3" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="alert alert-success mt-3" *ngIf="successMessage">{{ successMessage }}</div>

          <div class="mt-3 text-end" *ngIf="factures.length > 0">
            <button class="btn btn-success btn-lg" 
                    [disabled]="selectedRefs.size === 0 || isPaying" 
                    (click)="paySelected()">
              <span class="spinner-border spinner-border-sm" *ngIf="isPaying"></span>
              Payer ({{ selectedRefs.size }}) Factures
            </button>
          </div>
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
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: BillingApiService,
    public balanceStore: BalanceStore
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
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedRefs.clear();

    // Pour l'examen, on suppose que le code client = le phone number pour les factures de test
    // Le seeder (port 8081) a créé pour le code "WLT-0000003" par exemple.
    // On laisse tel quel pour s'adapter à l'API.
    this.api.getCurrentBills(phone, this.selectedService).subscribe({
      next: (data) => {
        this.factures = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        // On ne montre pas d'erreur fatale si 404 (pas de factures)
        this.factures = [];
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
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      phoneNumber: phone,
      serviceName: this.selectedService,
      factureReferences: Array.from(this.selectedRefs)
    };

    this.api.payBills(payload).subscribe({
      next: (res) => {
        this.isPaying = false;
        this.successMessage = `Paiement réussi ! Référence: ${res.reference}`;
        this.balanceStore.refresh();
        this.loadBills(); // Recharger pour enlever les factures payées
      },
      error: (err) => {
        this.isPaying = false;
        this.errorMessage = err.error?.message || 'Erreur lors du paiement.';
      }
    });
  }
}
