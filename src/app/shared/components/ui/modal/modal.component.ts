import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm transition-opacity" (click)="close()"></div>

      <!-- Modal Content -->
      <div class="relative w-auto my-6 mx-auto max-w-lg min-w-[400px] z-50 animate-modal-pop">
        <div class="border-0 rounded-2xl shadow-2xl relative flex flex-col w-full bg-white outline-none focus:outline-none">
          
          <!-- Header -->
          <div class="flex items-start justify-between p-5 border-b border-solid border-slate-100 rounded-t-2xl">
            <h3 class="text-xl font-semibold text-fintech-dark">
              {{ title }}
            </h3>
            <button class="p-1 ml-auto bg-transparent border-0 text-slate-400 hover:text-slate-600 float-right text-3xl leading-none font-semibold outline-none focus:outline-none transition-colors" (click)="close()">
              <span class="block text-2xl h-6 w-6 focus:outline-none">&times;</span>
            </button>
          </div>
          
          <!-- Body -->
          <div class="relative p-6 flex-auto">
            <ng-content></ng-content>
          </div>
          
          <!-- Footer -->
          <div *ngIf="hasFooter" class="flex items-center justify-end p-5 border-t border-solid border-slate-100 rounded-b-2xl bg-slate-50 gap-3">
            <ng-content select="[modal-footer]"></ng-content>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes modal-pop {
      0% { opacity: 0; transform: scale(0.95) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-modal-pop {
      animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() hasFooter = false;
  @Output() closeEvent = new EventEmitter<void>();

  close() {
    this.isOpen = false;
    this.closeEvent.emit();
  }

  open() {
    this.isOpen = true;
  }
}
