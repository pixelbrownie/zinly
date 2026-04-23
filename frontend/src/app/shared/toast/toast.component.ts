import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast toast-{{ toast.type }}"
        (click)="toastService.remove(toast.id)"
      >
        <span class="toast-icon">
          {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}
        </span>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border-radius: var(--radius-sm);
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      animation: fadeUp 0.3s ease forwards;
      box-shadow: var(--shadow-lift);
      min-width: 240px;
      max-width: 360px;
    }

    .toast-success {
      background: #ecfdf5;
      color: #065f46;
      border-left: 4px solid #10b981;
    }

    .toast-error {
      background: #fff1f2;
      color: #9f1239;
      border-left: 4px solid #ef4444;
    }

    .toast-info {
      background: var(--pink-light);
      color: var(--dark);
      border-left: 4px solid var(--pink);
    }

    .toast-icon {
      font-weight: 700;
      font-size: 1rem;
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
