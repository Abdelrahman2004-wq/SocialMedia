import { CanActivateFn } from '@angular/router';

export const alreadyloggedGuard: CanActivateFn = (route, state) => {
  return true;
};
