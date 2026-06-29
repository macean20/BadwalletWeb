import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletApiService, WalletDto, PageResponse } from '../../../core/services/wallet-api.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [CommonModule, XofPipe],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestion des Portefeuilles (Agent)</h2>
        <!-- On pourrait ajouter un bouton Créer ici -->
        <button class="btn btn-outline-primary"><i class="bi bi-person-plus"></i> Nouveau Client</button>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="text-center my-4" *ngIf="isLoading">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div class="table-responsive" *ngIf="!isLoading && pageData">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Code Wallet</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Solde Actuel</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let w of pageData.content">
                  <td>#{{ w.id }}</td>
                  <td><span class="badge bg-dark">{{ w.code }}</span></td>
                  <td class="fw-bold">{{ w.phoneNumber }}</td>
                  <td>{{ w.email }}</td>
                  <td class="fw-bold text-success">{{ w.balance | xof }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-success me-2" title="Faire un dépôt">Dépôt</button>
                    <button class="btn btn-sm btn-outline-danger" title="Faire un retrait">Retrait</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <nav *ngIf="!isLoading && pageData">
            <ul class="pagination justify-content-center">
              <li class="page-item" [class.disabled]="currentPage === 0">
                <button class="page-link" (click)="loadPage(currentPage - 1)">Précédent</button>
              </li>
              <li class="page-item disabled">
                <span class="page-link">Page {{ currentPage + 1 }} sur {{ pageData.totalPages }}</span>
              </li>
              <li class="page-item" [class.disabled]="currentPage >= pageData.totalPages - 1">
                <button class="page-link" (click)="loadPage(currentPage + 1)">Suivant</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class WalletListComponent implements OnInit {
  pageData: any = null;
  currentPage = 0;
  pageSize = 10;
  isLoading = false;

  constructor(private api: WalletApiService) {}

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
}
