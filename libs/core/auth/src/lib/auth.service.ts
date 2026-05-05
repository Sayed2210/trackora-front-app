import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole, Permission } from '@trackora/shared/domain';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly roles = computed(() => this._user()?.roles ?? []);
  readonly permissions = computed(() => this._user()?.permissions ?? []);

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
  }

  logout(): void {
    this._user.set(null);
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
