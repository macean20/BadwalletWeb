import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../core/utils/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div *ngFor="let toast of toastService.toasts()" 
           class="pointer-events-auto transform transition-all duration-300 ease-out animate-slide-in
                  flex items-start p-4 rounded-xl shadow-lg border"
           [ngClass]="{
             'bg-white border-emerald-100 text-emerald-800': toast.type === 'success',
             'bg-white border-red-100 text-red-800': toast.type === 'error',
             'bg-white border-blue-100 text-blue-800': toast.type === 'info'
           }">
        
        <!-- Icons -->
        <div class="flex-shrink-0 mr-3 mt-0.5">
          <svg *ngIf="toast.type === 'success'" class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg *ngIf="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg *ngIf="toast.type === 'info'" class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Message -->
        <div class="flex-1 text-sm font-medium">
          {{ toast.message }}
        </div>

        <!-- Close Button -->
        <button (click)="toastService.remove(toast.id)" class="ml-4 flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
