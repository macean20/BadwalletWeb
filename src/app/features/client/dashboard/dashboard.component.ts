import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceStore } from '../../../shared/store/balance.store';
import { XofPipe } from '../../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, XofPipe],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Mon Tableau de Bord</h2>
      
      <!-- Simulation du login (Pour les tests) -->
      <div class="card mb-4 shadow-sm" *ngIf="!balanceStore.currentPhone()">
        <div class="card-body">
          <h5 class="card-title">Simuler la connexion Client</h5>
          <div class="input-group mb-3" style="max-width: 400px;">
            <input type="text" class="form-control" placeholder="+22177..." #phoneInput value="+221779998877">
            <button class="btn btn-primary" (click)="login(phoneInput.value)">Se connecter</button>
          </div>
        </div>
      </div>

      <div class="row" *ngIf="balanceStore.currentPhone()">
        <div class="col-md-6">
          <div class="card text-white bg-primary mb-3 shadow">
            <div class="card-body text-center">
              <h5 class="card-title"><i class="bi bi-wallet2"></i> Solde Actuel</h5>
              <h2 class="display-4 fw-bold">{{ balanceStore.balance() | xof }}</h2>
              <p class="card-text">Mis à jour en temps réel (Signals)</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card mb-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title"><i class="bi bi-graph-up"></i> Raccourcis</h5>
              <div class="d-grid gap-2 mt-4">
                <a class="btn btn-outline-primary" routerLink="/transfer"><i class="bi bi-send"></i> Faire un transfert</a>
                <a class="btn btn-outline-secondary" routerLink="/bills/current"><i class="bi bi-receipt"></i> Payer une facture</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  constructor(public balanceStore: BalanceStore) {}

  ngOnInit(): void {
    // Refresh balance if already logged in
    if (this.balanceStore.currentPhone()) {
      this.balanceStore.refresh();
    }
  }

  login(phone: string) {
    this.balanceStore.setCurrentPhone(phone);
  }
}
