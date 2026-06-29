import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../shared/store/balance.store';

// Validateur pour le format du téléphone
function phoneValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const isValid = /^\+221[7][05678]\d{7}$/.test(value);
    return isValid ? null : { invalidPhone: true };
  };
}

// Validateur pour s'assurer que sender != receiver
function differentPhoneValidator(senderPhoneFn: () => string | null) {
  return (control: AbstractControl): ValidationErrors | null => {
    const receiver = control.get('receiverPhone')?.value;
    const sender = senderPhoneFn();
    if (sender && receiver && sender === receiver) {
      return { samePhone: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Transfert d'Argent</h2>

      <div class="alert alert-warning" *ngIf="!balanceStore.currentPhone()">
        Veuillez vous connecter via le Dashboard d'abord.
      </div>

      <div class="card shadow-sm" style="max-width: 500px;" *ngIf="balanceStore.currentPhone()">
        <div class="card-body">
          <form [formGroup]="transferForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-3">
              <label class="form-label">Numéro du destinataire</label>
              <input type="text" class="form-control" formControlName="receiverPhone" placeholder="+221...">
              <div class="text-danger small mt-1" *ngIf="transferForm.get('receiverPhone')?.errors?.['required'] && transferForm.get('receiverPhone')?.touched">Le numéro est requis.</div>
              <div class="text-danger small mt-1" *ngIf="transferForm.get('receiverPhone')?.errors?.['invalidPhone'] && transferForm.get('receiverPhone')?.touched">Format invalide (ex: +221770000000).</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Montant (XOF)</label>
              <input type="number" class="form-control" formControlName="amount" placeholder="Ex: 5000">
              <div class="text-danger small mt-1" *ngIf="transferForm.get('amount')?.errors?.['required'] && transferForm.get('amount')?.touched">Le montant est requis.</div>
              <div class="text-danger small mt-1" *ngIf="transferForm.get('amount')?.errors?.['min'] && transferForm.get('amount')?.touched">Le montant doit être supérieur à 0.</div>
            </div>

            <div class="alert alert-danger" *ngIf="transferForm.errors?.['samePhone'] && transferForm.touched">
              Vous ne pouvez pas faire un transfert vers votre propre numéro.
            </div>

            <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>
            <div class="alert alert-success" *ngIf="successMessage">{{ successMessage }}</div>

            <button type="submit" class="btn btn-primary w-100" [disabled]="transferForm.invalid || isLoading">
              <span class="spinner-border spinner-border-sm" *ngIf="isLoading"></span>
              {{ isLoading ? 'Transfert en cours...' : 'Envoyer' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TransferComponent implements OnInit {
  transferForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: WalletApiService,
    public balanceStore: BalanceStore
  ) {}

  ngOnInit(): void {
    this.transferForm = this.fb.group({
      receiverPhone: ['', [Validators.required, phoneValidator()]],
      amount: [null, [Validators.required, Validators.min(1)]]
    }, { validators: differentPhoneValidator(() => this.balanceStore.currentPhone()) });
  }

  onSubmit() {
    if (this.transferForm.invalid) return;

    const senderPhone = this.balanceStore.currentPhone();
    if (!senderPhone) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      senderPhone,
      receiverPhone: this.transferForm.value.receiverPhone,
      amount: this.transferForm.value.amount
    };

    this.api.transfer(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = `Transfert réussi ! Référence: ${res.reference}`;
        this.transferForm.reset();
        this.balanceStore.refresh(); // Mise à jour réactive du solde
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du transfert.';
      }
    });
  }
}
