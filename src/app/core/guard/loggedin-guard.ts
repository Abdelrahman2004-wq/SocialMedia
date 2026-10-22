import { CanActivateFn } from '@angular/router';

export const loggedinGuard: CanActivateFn = (route, state) => {
  return true;
};
