import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { appRoutes } from './app.routes';
import {
  authInterceptor,
  baseUrlInterceptor,
  errorInterceptor,
  retryInterceptor,
} from '@trackora/core/api';
import { TokenStorageService } from '@trackora/core/auth';
import {
  authFeature,
  layoutFeature,
  permissionsFeature,
} from '@trackora/core/state';
import { AuthRepository } from '@trackora/shared/data-access';

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
      ]),
    ),
    provideStore({
      auth: authFeature.reducer,
      layout: layoutFeature.reducer,
      permissions: permissionsFeature.reducer,
    }),
    provideTranslateService(),
    ...provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    provideAppInitializer(() => {
      const tokenStorage = inject(TokenStorageService);
      if (!tokenStorage.getAccessToken()) {
        return;
      }

      const authRepository = inject(AuthRepository);
      return firstValueFrom(
        authRepository.me().pipe(catchError(() => of(null))),
      );
    }),
  ],
};
