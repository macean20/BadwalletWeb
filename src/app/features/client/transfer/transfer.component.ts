import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { WalletApiService } from '../../../core/services/wallet-api.service';
import { BalanceStore } from '../../../shared/store/balance.store';
import { ToastService } from '../../../core/utils/toast.service';
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

// Custom Validator: Ensure Phone starts with +2217
function phoneValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const isValid = /^\+221[7][05678]\d{7}$/.test(value);
    return isValid ? null : { invalidPhone: true };
  };
}

// Custom Validator: Prevent sending to self
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
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      
      <div>
        <h2 class="text-2xl font-bold text-fintech-dark">Transfert d'Argent</h2>
        <p class="text-slate-500 text-sm mt-1">Envoyez des fonds instantanément et en toute sécurité.</p>
      </div>

      <app-card>
        <form [formGroup]="transferForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- Receiver Phone -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Numéro du destinataire</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <input type="text" formControlName="receiverPhone" placeholder="+221770000000"
                class="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-fintech-primary focus:border-fintech-primary sm:text-sm transition-colors"
                [ngClass]="{'border-red-300 focus:ring-red-500 focus:border-red-500': transferForm.get('receiverPhone')?.invalid && transferForm.get('receiverPhone')?.touched}">
            </div>
            
            <div class="mt-2 text-sm text-red-600" *ngIf="transferForm.get('receiverPhone')?.touched">
              <p *ngIf="transferForm.get('receiverPhone')?.errors?.['required']">Le numéro est obligatoire.</p>
              <p *ngIf="transferForm.get('receiverPhone')?.errors?.['invalidPhone']">Le numéro doit être au format sénégalais (ex: +221770000000).</p>
            </div>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Montant à envoyer (XOF)</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-slate-500 sm:text-sm font-bold">XOF</span>
              </div>
              <input type="number" formControlName="amount" placeholder="5000"
                class="block w-full pl-12 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-fintech-primary focus:border-fintech-primary sm:text-lg font-bold text-fintech-dark transition-colors"
                [ngClass]="{'border-red-300 focus:ring-red-500 focus:border-red-500': transferForm.get('amount')?.invalid && transferForm.get('amount')?.touched}">
            </div>
            
            <div class="mt-2 text-sm text-red-600" *ngIf="transferForm.get('amount')?.touched">
              <p *ngIf="transferForm.get('amount')?.errors?.['required']">Le montant est obligatoire.</p>
              <p *ngIf="transferForm.get('amount')?.errors?.['min']">Le montant minimum est de 1 XOF.</p>
            </div>
          </div>

          <!-- Cross Validation Error -->
          <div *ngIf="transferForm.errors?.['samePhone'] && transferForm.touched" class="p-4 bg-red-50 rounded-lg flex items-start gap-3 border border-red-100">
            <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-sm text-red-800 font-medium">Vous ne pouvez pas effectuer un transfert vers vous-même.</p>
          </div>

          <!-- Submit -->
          <div class="pt-4">
            <app-button type="submit" [fullWidth]="true" [loading]="isLoading" [disabled]="transferForm.invalid">
              Confirmer le transfert
            </app-button>
          </div>

        </form>
      </app-card>
    </div>
  `
})
export class TransferComponent implements OnInit {
  transferForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private api: WalletApiService,
    public balanceStore: BalanceStore,
    private toast: ToastService
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

    const payload = {
      senderPhone,
      receiverPhone: this.transferForm.value.receiverPhone,
      amount: this.transferForm.value.amount
    };

    this.api.transfer(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toast.success(`Transfert réussi ! Réf: ${res.reference}`);
        this.transferForm.reset();
        this.balanceStore.refresh(); // Mise à jour réactive du solde via le store
      },
      error: () => {
        // L'erreur est gérée globalement par le HttpErrorInterceptor (Affiche un Toast d'erreur)
        this.isLoading = false;
      }
    });
  }
}
