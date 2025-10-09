import { NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'shared-show-hide-password',
  standalone: true,
  imports: [NgIf],
  templateUrl: './show-hide-password.component.html',
  styleUrls: ['./show-hide-password.component.css']
})
export class ShowHidePasswordComponent implements OnInit {

  showPassword = false;
  @Output() onInputTypeChange = new EventEmitter<'text' | 'password'>();

  constructor() { }

  toggleShow() {
    this.showPassword = !this.showPassword;
    this.onInputTypeChange.emit(this.showPassword ? 'text' : 'password');

  }

  ngOnInit(): void {

  }

}
