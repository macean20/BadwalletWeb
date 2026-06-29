import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type"
      [disabled]="disabled || loading"
      [ngClass]="[
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        fullWidth ? 'w-full' : '',
        variantClasses[variant],
        disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
      ]"
      (click)="onClick($event)">
      
      <!-- Spinner -->
      <svg *ngIf="loading" class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>

      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'outline' = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  readonly variantClasses = {
    primary: 'bg-fintech-primary text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500',
    danger: 'bg-fintech-danger text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
    outline: 'border-2 border-fintech-primary text-fintech-primary hover:bg-blue-50 focus:ring-blue-500'
  };

  onClick(event: Event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
