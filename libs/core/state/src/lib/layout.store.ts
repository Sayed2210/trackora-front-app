import { createFeature, createReducer, createAction, props, on } from '@ngrx/store';

export interface LayoutState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
}

const initialState: LayoutState = {
  sidebarOpen: true,
  theme: 'light',
  language: 'ar',
  direction: 'rtl',
};

export const toggleSidebar = createAction('[Layout] Toggle Sidebar');
export const setLanguage = createAction('[Layout] Set Language', props<{ language: 'en' | 'ar' }>());

export const layoutFeature = createFeature({
  name: 'layout',
  reducer: createReducer(
    initialState,
    on(toggleSidebar, (state) => ({ ...state, sidebarOpen: !state.sidebarOpen })),
    on(setLanguage, (state, { language }) => ({
      ...state,
      language,
      direction: language === 'ar' ? 'rtl' : 'ltr',
    }))
  ),
});

export const { selectLayoutState, selectSidebarOpen, selectTheme, selectLanguage, selectDirection } = layoutFeature;
