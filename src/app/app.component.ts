import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/ui/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastContainerComponent],
  template: `
    <app-toast-container></app-toast-container>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'badwallet-web';
}
