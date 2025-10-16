// import { Component, inject, OnDestroy, OnInit, Optional } from '@angular/core';
// import { HeaderComponent } from './components/header/header.component';
// import { SidenavComponent } from './components/sidenav/sidenav.component';
// import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { AuthService } from '../../features/auth/services/auth.service';
// import { filter, Subscription } from 'rxjs';

// @Component({
//   selector: 'app-layout',
//   standalone: true,
//   templateUrl: './layout.component.html',
//   styleUrls: ['./layout.component.scss'],
//   imports: [HeaderComponent, SidenavComponent, RouterOutlet, NgbModule],
// })
// export class LayoutComponent implements OnInit, OnDestroy {
//   showMobileNav = false;
//   routeChangeSubscription?: Subscription;
//   private readonly router = inject(Router);

//   constructor(@Optional() private auth: AuthService) {}

//   get hasUser() {
//     return !!this.auth.user;
//   }

//   ngOnInit() {
//     this.routeChangeSubscription = this.router.events
//       .pipe(filter((event) => event instanceof NavigationEnd))
//       .subscribe((event) => {
//         this.showMobileNav = false;
//       });
//   }

//   ngOnDestroy() {
//     this.routeChangeSubscription?.unsubscribe();
//   }

//   handleOpenMobileNav() {
//     this.showMobileNav = !this.showMobileNav;
//   }
// }

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { filter, Subscription } from 'rxjs';

@Component({
    selector: 'app-layout',
    standalone: true,
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    imports: [HeaderComponent, SidenavComponent, RouterOutlet, NgbModule]
})
export class LayoutComponent implements OnInit, OnDestroy {
  showMobileNav = false;
  private readonly router = inject(Router);
  routeChangeSubscription?: Subscription;

  ngOnInit() {
    this.routeChangeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showMobileNav = false;
      });
  }

  ngOnDestroy() {
    this.routeChangeSubscription?.unsubscribe();
  }

  handleOpenMobileNav() {
    this.showMobileNav = !this.showMobileNav;
  }
}

