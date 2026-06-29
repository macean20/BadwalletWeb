import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BalanceStore } from '../../store/balance.store';
import { XofPipe } from '../../pipes/xof.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, XofPipe],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/dashboard"><i class="bi bi-wallet2"></i> BadWallet</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/transfer" routerLinkActive="active">Transfert</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bills/current" routerLinkActive="active">Factures</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/transactions" routerLinkActive="active">Historique</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-warning" routerLink="/admin/wallets" routerLinkActive="active"><i class="bi bi-shield-lock"></i> Admin</a>
            </li>
          </ul>
          <div class="d-flex align-items-center">
            <span class="text-light me-3" *ngIf="balanceStore.currentPhone()">Client: {{ balanceStore.currentPhone() }}</span>
            <span class="badge bg-light text-primary fs-6 shadow-sm" *ngIf="balanceStore.balance() !== null">
              {{ balanceStore.balance() | xof }}
            </span>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(public balanceStore: BalanceStore) {}
}
