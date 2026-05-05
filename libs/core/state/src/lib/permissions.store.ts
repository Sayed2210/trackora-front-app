import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Permission } from '@trackora/shared/domain';

export interface PermissionsState {
  permissions: Permission[];
}

const initialState: PermissionsState = {
  permissions: [],
};

export const permissionsFeature = createFeature({
  name: 'permissions',
  reducer: createReducer(
    initialState,
    on(
      { type: '[Permissions] Set', permissions: [] as Permission[] },
      (state, { permissions }) => ({ ...state, permissions })
    )
  ),
});

export const { selectPermissionsState, selectPermissions } = permissionsFeature;

export const selectHasPermission = (permission: Permission) =>
  createSelector(selectPermissions, (permissions) => permissions.includes(permission));
