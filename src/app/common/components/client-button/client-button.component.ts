import { Component, EventEmitter, Input, Output } from '@angular/core';
import ProducerClientDto from '../../../core/data/dtos/producer-client.dto';

@Component({
    selector: 'app-client-button',
    imports: [],
    templateUrl: './client-button.component.html',
    styleUrl: './client-button.component.css'
})
export class ClientButtonComponent {
  @Input({ required: true }) client!: ProducerClientDto;
  @Output() clicked = new EventEmitter();

  handleClick() {
    this.clicked.emit();
  }
}
