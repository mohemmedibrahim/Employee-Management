import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PageTitleStrategy } from './core/services/page-title.strategy';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog.component';
import { IconComponent, IconName } from './shared/components/icon.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
}

/** Application shell: left sidebar, top navigation bar and the routed page content. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DatePipe,
    IconComponent,
    ToastContainerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly router = inject(Router);

  protected readonly pageTitle = inject(PageTitleStrategy).pageTitle;
  protected readonly sidebarOpen = signal(false);
  protected readonly today = new Date();

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Departments', path: '/departments', icon: 'departments' },
    { label: 'Employees', path: '/employees', icon: 'employees' },
  ];

  constructor() {
    // Close the mobile sidebar after every navigation.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.sidebarOpen.set(false));
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
