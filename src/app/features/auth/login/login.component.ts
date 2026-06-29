import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BalanceStore } from '../../../shared/store/balance.store';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { ToastService } from '../../../core/utils/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <form class="mt-8 space-y-6 bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="phone" class="block text-sm font-medium text-slate-700">Numéro de téléphone</label>
        <div class="mt-2 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <input id="phone" type="text" formControlName="phone"
            class="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-fintech-primary focus:border-fintech-primary sm:text-sm placeholder-slate-400 transition-colors"
            placeholder="+221770000000"
            [ngClass]="{'border-red-300 focus:ring-red-500 focus:border-red-500': f['phone'].invalid && f['phone'].touched}">
        </div>
        <p *ngIf="f['phone'].errors?.['required'] && f['phone'].touched" class="mt-2 text-sm text-red-600">
          Le numéro est requis.
        </p>
        <p *ngIf="f['phone'].errors?.['pattern'] && f['phone'].touched" class="mt-2 text-sm text-red-600">
          Format invalide (Exemple: +221770000000).
        </p>
      </div>

      <div class="pt-2">
        <app-button type="submit" [fullWidth]="true" [loading]="isLoading" [disabled]="loginForm.invalid">
          Se connecter
        </app-button>
      </div>

      <div class="mt-6 text-center">
        <p class="text-xs text-slate-500">
          Pour la démo, utilisez le numéro généré par le backend (ex: +221779998877)
        </p>
      </div>
    </form>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private balanceStore: BalanceStore,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      phone: ['+221779998877', [Validators.required, Validators.pattern(/^\+221[7][05678]\d{7}$/)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    
    // Simulation d'un petit délai pour l'expérience UX (loader)
    setTimeout(() => {
      const phone = this.loginForm.value.phone;
      this.balanceStore.setCurrentPhone(phone);
      this.toastService.success('Connexion réussie !');
      this.router.navigate(['/dashboard']);
      this.isLoading = false;
    }, 600);
  }
}
