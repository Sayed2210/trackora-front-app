import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { appRoutes } from './app.routes';
import {
  authInterceptor,
  baseUrlInterceptor,
  errorInterceptor,
  retryInterceptor,
} from '@trackora/core/api';
import { authFeature, layoutFeature, notificationsFeature, permissionsFeature } from '@trackora/core/state';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

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
      notifications: notificationsFeature.reducer,
      permissions: permissionsFeature.reducer,
    }),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
};
