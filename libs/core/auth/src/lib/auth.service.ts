import { Injectable, signal, computed, inject } from '@angular/core';
import { User, UserRole, Permission } from '@trackora/shared/domain';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(
    () => !!this._user() && !!this.tokenStorage.getAccessToken()
  );
  readonly roles = computed(() => this._user()?.roles ?? []);
  readonly permissions = computed(() => this._user()?.permissions ?? []);

  constructor() {
    this.restoreSession();
  }

  hasPermission(permission: Permission): boolean {
    return this.permissions().includes(permission);
  }

  hasRole(role: UserRole): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(allowedRoles: UserRole[]): boolean {
    return allowedRoles.some((role) => this.hasRole(role));
  }

  setUser(user: User | null): void {
    this._user.set(user);
    if (user) {
      this.tokenStorage.setUser(user);
    }
  }

  restoreSession(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    const user = this.tokenStorage.getUser();

    if (accessToken && user) {
      this._user.set(user);
      return;
    }

    if (!accessToken || !user) {
      this._user.set(null);
    }
  }

  logout(): void {
    this._user.set(null);
    this.tokenStorage.clear();
  }
}
