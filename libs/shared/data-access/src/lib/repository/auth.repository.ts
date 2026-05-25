import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { ApiClient } from '@trackora/core/api';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { loginSuccess, logout } from '@trackora/core/state';
import { User } from '@trackora/shared/domain';
import { AuthUserDto, LoginRequestDto, LoginResponseDto } from '../dto/auth.dto';
import { AuthMapper } from '../mapper/auth.mapper';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly store = inject(Store);

  constructor(
    private readonly api: ApiClient,
    private readonly authService: AuthService,
    private readonly tokenStorage: TokenStorageService
  ) {}

  login(dto: LoginRequestDto): Observable<User> {
    return this.api.post<LoginResponseDto>('/auth/login', dto).pipe(
      map((res) => ({ res, user: AuthMapper.mapUser(res.user) })),
      tap(({ res, user }) => {
        this.tokenStorage.setAccessToken(res.accessToken);
        this.tokenStorage.setRefreshToken(res.refreshToken);
        this.authService.setUser(user);
        this.store.dispatch(loginSuccess({ user }));
      }),
      map(({ user }) => user)
    );
  }

  me(): Observable<User> {
    return this.api.get<AuthUserDto>('/auth/me').pipe(
      map((dto) => AuthMapper.mapUser(dto)),
      tap((user) => {
        this.authService.setUser(user);
        this.store.dispatch(loginSuccess({ user }));
      })
    );
  }

  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {}).pipe(
      tap(() => {
        this.authService.logout();
        this.store.dispatch(logout());
      })
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }).pipe(
      tap((res) => this.tokenStorage.setAccessToken(res.accessToken)),
      map((res) => res.accessToken)
    );
  }

  register(dto: any): Observable<any> {
    return this.api.post('/auth/register', dto);
  }

  sendOtp(): Observable<any> {
    return this.api.post('/auth/otp/send', {});
  }

  verifyOtp(): Observable<any> {
    return this.api.post('/auth/otp/verify', {});
  }
}
