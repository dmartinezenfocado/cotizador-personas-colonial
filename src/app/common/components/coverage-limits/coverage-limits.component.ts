import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CoverageDef } from '../../../core/data/models/coverage-def.model';

@Component({
    selector: 'app-coverages-limits',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './coverage-limits.component.html',
    styleUrls: ['./coverage-limits.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoveragesLimitsComponent {
  @Input({ required: true }) definitions!: readonly CoverageDef[];
  @Input() visibleTierIdxs: readonly number[] = [0, 1, 2];
  @Input({ required: true }) coveragesFA!: FormArray;
  @Output() coverageToggled = new EventEmitter<{ index: number; selected: boolean }>();
  @Output() coveragesChanged = new EventEmitter<void>();

  selectedToAdd: string = ''; 

  trackByIndex(i: number) { return i; }

  private emitChange(): void {
    this.coveragesChanged.emit();
  }

  getGroup(i: number): FormGroup {
    return this.coveragesFA.at(i) as FormGroup;
  }

  isSelected(i: number): boolean {
    return !!this.getGroup(i).get('selected')?.value;
  }

  
  get availableIdx(): number[] {
    return this.definitions.map((_, i) => i).filter(i => !this.isSelected(i));
  }


  get selectedIdx(): number[] {
    return this.definitions.map((_, i) => i).filter(i => this.isSelected(i));
  }

  onSelectToAdd(raw: string): void {
    this.selectedToAdd = raw;
    this.addSelected();
    this.emitChange();
  }

  
  addSelected(): void {
    if (this.selectedToAdd === '' || this.selectedToAdd == null) return;
    const i = Number(this.selectedToAdd);
    const fg = this.getGroup(i);
    const def = this.definitions[i];

    fg.get('selected')?.setValue(true, { emitEvent: false });

    if (def?.kind === 'tier' && def.tiers?.length) {
      fg.get('amount')?.setValue(def.tiers[0], { emitEvent: false }); // primer tier por defecto
    } else if (def?.kind === 'free') {
      fg.get('amount')?.setValue(null, { emitEvent: false });
    }

    this.coverageToggled.emit({ index: i, selected: true });
    this.selectedToAdd = '';
    this.emitChange(); 
  }

  
  removeSelected(i: number): void {
    const fg = this.getGroup(i);
    fg.get('selected')?.setValue(false, { emitEvent: false });
    fg.get('amount')?.reset(null, { emitEvent: false });
    this.coverageToggled.emit({ index: i, selected: false });
    this.emitChange(); 
  }


  chooseTier(i: number, value: string | number): void {
    const v = typeof value === 'string' ? Number(value) : value;
    this.getGroup(i).get('amount')?.setValue(v);
    this.emitChange(); 
  }

  onToggle(i: number): void {
    const fg = this.getGroup(i);
    const selected = !!fg.get('selected')?.value;
    const def = this.definitions[i];

    if (!selected && def.kind === 'free') {
      fg.get('amount')?.reset(null);
    }

    this.coverageToggled.emit({ index: i, selected });
    this.emitChange(); 
  }
}
