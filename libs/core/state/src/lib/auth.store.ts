import { createFeature, createReducer, createSelector, createAction, props, on } from '@ngrx/store';
import { User } from '@trackora/shared/domain';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User }>());
export const logout = createAction('[Auth] Logout');

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(loginSuccess, (state, { user }) => ({ ...state, user, loading: false, error: null })),
    on(logout, () => initialState)
  ),
});

export const { selectAuthState, selectUser, selectLoading, selectError } = authFeature;

export const selectIsAuthenticated = createSelector(
  selectUser,
  (user) => !!user
);
