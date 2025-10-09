import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [  FormsModule, CommonModule],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css',
})

export class SearchModalComponent {
  @Input() visible = false;
  @Input() titulo = 'Búsqueda';
  @Input() resultados: any[] = [];
  @Input() columnas: { campo: string, titulo: string }[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() seleccionar = new EventEmitter<any>();

  parametro = '';

  get resultadosFiltrados() {
    return this.resultados.filter(item =>
      this.columnas.some(col =>
        String(item[col.campo]).toLowerCase().includes(this.parametro.toLowerCase())
      )
    );
  }

  onSeleccionar(item: any) {
    this.seleccionar.emit(item);
    this.cerrar.emit();
  }
}

