import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { appRoutes } from './app.routes';
import {
  authInterceptor,
  baseUrlInterceptor,
  errorInterceptor,
  retryInterceptor,
} from '@trackora/core/api';
import { authFeature, layoutFeature, permissionsFeature } from '@trackora/core/state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        baseUrlInterceptor,
        errorInterceptor,
        retryInterceptor,
      ])
    ),
    provideStore({
      auth: authFeature.reducer,
      layout: layoutFeature.reducer,
      permissions: permissionsFeature.reducer,
    }),
    provideTranslateService(),
    ...provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
  ],
};
