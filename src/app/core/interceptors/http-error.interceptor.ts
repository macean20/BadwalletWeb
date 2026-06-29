import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../utils/toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inattendue est survenue.';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Erreur côté serveur (Spring Boot)
        if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur (Erreur réseau).';
        } else if (error.error && error.error.message) {
          // Erreurs formatées par notre GlobalExceptionHandler de Spring
          errorMessage = error.error.message;
        } else {
          errorMessage = `Erreur serveur HTTP ${error.status}`;
        }
      }

      toastService.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
