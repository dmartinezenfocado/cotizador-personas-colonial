import { Component, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-sidenav',
    standalone: true,
    imports: [RouterLink, NgFor, RouterLinkActive],
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  menuItems: any[] = [
    {
      route: '/individual-person',
      icon: 'person',
      name: 'Individual',
      allowedProfiles: []
    },
    {
      route: '/collective-Person',
      icon: 'groups',
      name: 'Colectiva',
      allowedProfiles: []
    },
    {
      route: 'schoolchildren-person',
      icon: 'groups',
      name: 'Escolares',
      allowedProfiles: []
    },
  ]

  constructor() {}
 
}
