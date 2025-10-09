import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../../features/auth/services/auth.service";

export const publicGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService)

  if (!authService.user){
    inject(Router).navigate(['/auth/login'])
    return true
  }

  inject(Router).navigate([authService.home])

  return false
};
