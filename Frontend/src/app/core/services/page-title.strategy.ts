import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/**
 * Builds the browser tab title from each route's `title` and also exposes it
 * as a signal so the top bar can display the current page name.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly currentTitle = signal('Dashboard');

  readonly pageTitle = this.currentTitle.asReadonly();

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    if (routeTitle) {
      this.currentTitle.set(routeTitle);
      this.title.setTitle(`${routeTitle} · Employee Management System`);
    }
  }
}
