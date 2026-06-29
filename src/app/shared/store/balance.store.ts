import { Injectable, signal } from '@angular/core';
import { WalletApiService } from '../../core/services/wallet-api.service';

@Injectable({ providedIn: 'root' })
export class BalanceStore {
  readonly balance = signal<number | null>(null);
  readonly currentPhone = signal<string | null>(null);
  readonly isAgent = signal<boolean>(false);

  constructor(private api: WalletApiService) {}

  setCurrentPhone(phone: string) {
    this.currentPhone.set(phone);
    this.isAgent.set(phone === '+221770000000');
    this.refresh();
  }

  clear() {
    this.currentPhone.set(null);
    this.isAgent.set(false);
    this.balance.set(null);
  }

  refresh() {
    const phone = this.currentPhone();
    if (phone && !this.isAgent()) {
      this.api.getBalance(phone).subscribe({
        next: (res: any) => {
          // Si l'API renvoie un objet avec balance, sinon juste le number
          const bal = typeof res === 'object' ? res.balance : res;
          this.balance.set(bal);
        },
        error: () => this.balance.set(null)
      });
    }
  }
}
