import { createFeature, createReducer, createSelector, createAction, props, on } from '@ngrx/store';
import { Permission } from '@trackora/shared/domain';

export interface PermissionsState {
  permissions: Permission[];
}

const initialState: PermissionsState = {
  permissions: [],
};

export const setPermissions = createAction('[Permissions] Set', props<{ permissions: Permission[] }>());

export const permissionsFeature = createFeature({
  name: 'permissions',
  reducer: createReducer(
    initialState,
    on(setPermissions, (state, { permissions }) => ({ ...state, permissions }))
  ),
});

export const { selectPermissionsState, selectPermissions } = permissionsFeature;

export const selectHasPermission = (permission: Permission) =>
  createSelector(selectPermissions, (permissions) => permissions.includes(permission));
