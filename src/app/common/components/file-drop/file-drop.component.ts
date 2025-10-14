import {Component, EventEmitter, Input, Output} from '@angular/core';
import acceptedImages from "../../constants/acceptedImages";
import {NgxFileDropEntry} from "ngx-file-drop";

@Component({
    selector: 'shared-file-drop',
    templateUrl: './file-drop.component.html',
    styleUrls: ['./file-drop.component.css'],
    standalone: false
})
export class FileDropComponent {
  @Input() placeholder = ''
  @Output() dropped = new EventEmitter<NgxFileDropEntry[]>()

  handleDropped($event: NgxFileDropEntry[]) {
    this.dropped.emit($event)
  }

  protected readonly acceptedImages = acceptedImages;
}
