import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
// import { MsalGuard } from '@azure/msal-angular';
// import authRoutes from './features/auth/routes';
import individualPersonFormRoutes from './features/persona-individual/routes';


export const routes: Routes = [
  // ...authRoutes,
  {
    path: '',
   // canActivate: [MsalGuard],
    component: LayoutComponent,
    children: [
      {
        path:'',
        redirectTo:'dashboard',
        pathMatch:'full'
      },
      ...individualPersonFormRoutes,
    ]
  },

  { path: '**', redirectTo: '' },
];
