import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { User } from '@trackora/shared/domain';
import { LoginRequestDto, LoginResponseDto } from '../dto/auth.dto';
import { AuthMapper } from '../mapper/auth.mapper';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  constructor(
    private readonly api: ApiClient,
    private readonly authService: AuthService,
    private readonly tokenStorage: TokenStorageService
  ) {}

  login(dto: LoginRequestDto): Observable<User> {
    return this.api.post<LoginResponseDto>('/auth/login', dto).pipe(
      tap((res) => {
        this.tokenStorage.setAccessToken(res.accessToken);
        this.tokenStorage.setRefreshToken(res.refreshToken);
      }),
      map((res) => {
        const user = AuthMapper.mapUser(res.user);
        this.authService.setUser(user);
        return user;
      })
    );
  }

  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {}).pipe(
      tap(() => {
        this.authService.logout();
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
}
