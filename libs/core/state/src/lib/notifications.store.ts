import { createFeature, createReducer, on } from '@ngrx/store';

export interface Notification {
  id: string;
  message: string;
  severity: 'success' | 'info' | 'warn' | 'error';
  duration?: number;
}

export interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

export const notificationsFeature = createFeature({
  name: 'notifications',
  reducer: createReducer(
    initialState,
    on(
      { type: '[Notification] Add', notification: null as unknown as Notification },
      (state, { notification }) => ({
        ...state,
        items: [...state.items, notification],
        unreadCount: state.unreadCount + 1,
      })
    ),
    on(
      { type: '[Notification] Remove', id: '' },
      (state, { id }) => ({
        ...state,
        items: state.items.filter((n) => n.id !== id),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })
    )
  ),
});

export const { selectNotificationsState, selectItems, selectUnreadCount } = notificationsFeature;
