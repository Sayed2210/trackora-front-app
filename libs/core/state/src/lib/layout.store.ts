import { createFeature, createReducer, on } from '@ngrx/store';

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

export const layoutFeature = createFeature({
  name: 'layout',
  reducer: createReducer(
    initialState,
    on(
      { type: '[Layout] Toggle Sidebar' },
      (state) => ({ ...state, sidebarOpen: !state.sidebarOpen })
    ),
    on(
      { type: '[Layout] Set Language', language: 'ar' as 'en' | 'ar' },
      (state, { language }) => ({
        ...state,
        language,
        direction: language === 'ar' ? 'rtl' : 'ltr',
      })
    )
  ),
});

export const { selectLayoutState, selectSidebarOpen, selectTheme, selectLanguage, selectDirection } = layoutFeature;
