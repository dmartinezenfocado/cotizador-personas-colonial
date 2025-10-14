import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import individualPersonFormRoutes from './features/individual-person/routes';
import CollectivePersonFormRoutes from './features/collective-person/routes';
import SchoolChildrenPersonRoutes from './features/schoolchildren-person/routes';


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
      ...SchoolChildrenPersonRoutes,

    ]
  },

  { path: '**', redirectTo: '' },
];
