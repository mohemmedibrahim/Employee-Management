import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

/** Shows short-lived notification toasts (rendered by ToastContainerComponent). */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastList = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = this.toastList.asReadonly();

  success(message: string): void {
    this.show('success', message, 4000);
  }

  error(message: string): void {
    this.show('error', message, 7000);
  }

  info(message: string): void {
    this.show('info', message, 4000);
  }

  dismiss(id: number): void {
    this.toastList.update((list) => list.filter((toast) => toast.id !== id));
  }

  private show(kind: ToastKind, message: string, durationMs: number): void {
    const id = this.nextId++;
    this.toastList.update((list) => [...list, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}
