import { Injectable, computed, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Styles the confirm button as a destructive action. */
  danger?: boolean;
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (confirmed: boolean) => void;
}

/**
 * Promise-based confirmation dialog:
 *   if (await this.confirm.ask({ title: 'Delete?', message: '...' })) { ... }
 * The dialog itself is rendered once by ConfirmDialogComponent in the app shell.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pending = signal<PendingConfirm | null>(null);

  readonly options = computed(() => this.pending()?.options ?? null);

  ask(options: ConfirmOptions): Promise<boolean> {
    // If a dialog is already open, treat it as cancelled.
    this.pending()?.resolve(false);

    return new Promise<boolean>((resolve) => {
      this.pending.set({ options, resolve });
    });
  }

  answer(confirmed: boolean): void {
    const current = this.pending();
    this.pending.set(null);
    current?.resolve(confirmed);
  }
}
