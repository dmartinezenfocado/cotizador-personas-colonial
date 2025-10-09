import { Component, EventEmitter, Optional, Output} from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgbModule, SidenavComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() openMobileNav = new EventEmitter()

  get hasUser() {
    return false; 
  }

  get isClient() {
    return false;
  }

  openMenu(): void {
    this.openMobileNav.emit();
  }
}
