import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="['animate-pulse bg-slate-200 rounded', widthClass, heightClass, className]"></div>
  `
})
export class SkeletonComponent {
  @Input() widthClass = 'w-full';
  @Input() heightClass = 'h-4';
  @Input() className = '';
}
