import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  authInterceptor,
  baseUrlInterceptor,
  errorInterceptor,
  retryInterceptor,
} from '@trackora/core/api';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([
        baseUrlInterceptor,
        authInterceptor,
        errorInterceptor,
        retryInterceptor,
      ]),
    ),
  ],
};
