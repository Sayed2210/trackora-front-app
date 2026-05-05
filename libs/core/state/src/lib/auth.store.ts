import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
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

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(
      { type: '[Auth] Login Success', user: null as unknown as User },
      (state, { user }) => ({ ...state, user, loading: false, error: null })
    ),
    on(
      { type: '[Auth] Logout' },
      () => initialState
    )
  ),
});

export const { selectAuthState, selectUser, selectLoading, selectError } = authFeature;

export const selectIsAuthenticated = createSelector(
  selectUser,
  (user) => !!user
);
