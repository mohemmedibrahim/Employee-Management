import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { PageTitleStrategy } from './core/services/page-title.strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // Angular HttpClient + interceptor that turns failed requests into friendly ApiError objects
    provideHttpClient(withInterceptors([apiErrorInterceptor])),
    { provide: TitleStrategy, useExisting: PageTitleStrategy },
  ],
};
