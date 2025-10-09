import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import individualPersonFormRoutes from './features/individual-person/routes';
import CollectivePersonFormRoutes from './features/collective-person/routes';
//import individualPersonFormRoutes from './features/collective-person/routes';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path:'',
        redirectTo:'dashboard',
        pathMatch:'full'
      },
      ...individualPersonFormRoutes,
      ...CollectivePersonFormRoutes,

    ]
  },

  { path: '**', redirectTo: '' },
];
