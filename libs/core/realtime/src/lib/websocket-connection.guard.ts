import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { WebSocketService } from './websocket.service';
import { AuthService } from '@trackora/core/auth';

export const websocketConnectionGuard: CanActivateFn = () => {
  const ws = inject(WebSocketService);
  const auth = inject(AuthService);

  if (auth.isAuthenticated()) {
    ws.connect();
  }

  // Watch auth state changes
  const user = auth.user;
  // Using effect-like pattern: check on navigation and let components handle disconnect
  if (user()) {
    ws.connect();
  } else {
    ws.disconnect();
  }

  return true;
};
