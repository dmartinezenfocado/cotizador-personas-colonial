import {ChangeDetectionStrategy, Component, computed, input, output, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { CoverageDef } from '../../../core/data/models/coverage-def.model';

type AmountType = number | null;

interface CoverageForm {
  selected: FormControl<boolean>;
  amount: FormControl<AmountType>;
}

@Component({
  selector: 'app-coverages-limits',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coverage-limits.component.html',
  styleUrls: ['./coverage-limits.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CoveragesLimitsComponent {
  definitions = input.required<readonly CoverageDef[]>();
  visibleTierIdxs = input<readonly number[]>([0, 1, 2] as const);
  coveragesFA = input.required<FormArray<FormGroup<CoverageForm>>>();
  coverageToggled = output<{ index: number; selected: boolean }>();
  coveragesChanged = output<void>();

  selectedToAdd = signal<string>('');
  private changeTick = signal(0); 

  readonly availableIdx = computed(() => {
    const defs = this.definitions();
    return defs.map((_, i) => i).filter((i) => !this.isSelected(i));
  });

  readonly selectedIdx = computed(() => {
    const defs = this.definitions();
    this.changeTick();
    return defs.map((_, i) => i).filter((i) => this.isSelected(i));
  });

  private getDefinition(i: number): CoverageDef | null {
    const defs = this.definitions();
    return i >= 0 && i < defs.length ? defs[i] : null;
  }

  getGroup(i: number): FormGroup<CoverageForm> {
    const fa = this.coveragesFA();
    const fg = fa.at(i) as FormGroup<CoverageForm> | undefined;
    if (!fg) throw new Error(`FormGroup no encontrado en índice ${i}`);
    return fg;
  }

  isSelected(i: number): boolean {
    const fg = this.getGroup(i);
    return !!fg.controls.selected.value;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private emitChange(): void {
    this.coveragesChanged.emit();
    this.changeTick.update((v) => v + 1);
  }

  onSelectToAdd(raw: string): void {
    this.selectedToAdd.set(raw);
    this.addSelected();
    this.emitChange();
  }

  addSelected(): void {
    const raw = this.selectedToAdd();
    if (raw === '' || raw == null) return;

    const i = Number(raw);
    if (!Number.isFinite(i)) return;

    const def = this.getDefinition(i);
    if (!def) return;

    const fg = this.getGroup(i);

    fg.controls.selected.setValue(true, { emitEvent: false });

    if (def.kind === 'tier' && Array.isArray(def.tiers) && def.tiers.length) {
      const first = Number(def.tiers[0]);
      fg.controls.amount.setValue(Number.isFinite(first) ? first : null, {
        emitEvent: false
      });
    } else if (def.kind === 'free') {
      fg.controls.amount.setValue(null, { emitEvent: false });
    }

    this.coverageToggled.emit({ index: i, selected: true });
    this.selectedToAdd.set('');
    this.emitChange();
  }

  removeSelected(i: number): void {
    const def = this.getDefinition(i);
    if (!def) return;

    const fg = this.getGroup(i);
    fg.controls.selected.setValue(false, { emitEvent: false });
    fg.controls.amount.reset(null, { emitEvent: false });

    this.coverageToggled.emit({ index: i, selected: false });
    this.emitChange();
  }

  chooseTier(i: number, value: string | number): void {
    const v = Number(value);
    const fg = this.getGroup(i);
    fg.controls.amount.setValue(Number.isFinite(v) ? v : null);
    this.emitChange();
  }

  onToggle(i: number): void {
    const def = this.getDefinition(i);
    if (!def) return;

    const fg = this.getGroup(i);
    const selected = !!fg.controls.selected.value;

    if (!selected && def.kind === 'free') {
      fg.controls.amount.reset(null);
    }

    this.coverageToggled.emit({ index: i, selected });
    this.emitChange();
  }
}
