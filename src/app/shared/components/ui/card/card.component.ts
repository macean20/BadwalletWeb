import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-fintech-card rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <!-- Card Header -->
      <div *ngIf="title || subtitle" class="px-6 py-4 border-b border-slate-50">
        <h3 class="text-lg font-semibold text-fintech-dark">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-slate-500 mt-1">{{ subtitle }}</p>
      </div>
      
      <!-- Card Body -->
      <div class="px-6 py-5">
        <ng-content></ng-content>
      </div>

      <!-- Card Footer -->
      <div *ngIf="hasFooter" class="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() hasFooter = false;
}
