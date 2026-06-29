import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { BalanceStore } from '../../shared/store/balance.store';
import { ToastService } from '../utils/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const balanceStore = inject(BalanceStore);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (balanceStore.currentPhone()) {
    return true;
  }

  toastService.info('Veuillez vous connecter pour accéder à cette page.');
  return router.createUrlTree(['/login']);
};
