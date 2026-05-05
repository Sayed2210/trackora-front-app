import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole, Permission } from '@trackora/shared/domain';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => inject(AuthService).hasAnyRole(allowedRoles);
};

export const permissionGuard = (permission: Permission): CanActivateFn => {
  return () => inject(AuthService).hasPermission(permission);
};
