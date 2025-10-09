import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
class CanActivateGuard {
  constructor(private msalService: MsalService,
    private router: Router,
    private msalBroadcastService: MsalBroadcastService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        switchMap(() => {
          if (this.msalService.instance.getAllAccounts().length > 0) {
            return of(true);
          }

          this.router.navigate(['/auth/login']);
          return of(false);
        })
      );
  }
}

export const authGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  if (inject(CanActivateGuard).canActivate(next, state)) {
    return true;
  } else {
    inject(Router).navigate(['/auth/login']);
    return false;
  }
}