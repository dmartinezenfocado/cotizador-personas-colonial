import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CoverageDef } from '../../../core/data/models/coverage-def.model';
import { AmountType, CoverageForm, EditableRows, SelectionMode } from '../../../core/data/models/coverage-form.model';



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
  showCheckboxes = input<boolean>(true);
  selectionMode = input<SelectionMode>('checkbox');
  editableRows = input<EditableRows>([] as const);
  enableEdgeEdit = input<boolean>(false);
  private changeTick = signal(0);
  private colOverrides = signal<(number | null)[]>([null, null, null]);


  private isAlways(): boolean {
    return this.selectionMode() === 'always';
  }
  showChecks(): boolean {
    return this.showCheckboxes() && !this.isAlways();
  }

  private readonly editableSet = computed(() => {
    const cfg = this.editableRows();
    if (cfg === 'firstLast') {
      const len = this.definitions().length;
      return len ? new Set([0, Math.max(0, len - 1)]) : new Set<number>();
    }
    return new Set<number>(Array.isArray(cfg) ? cfg : []);
  });

  isRowEnabled(i: number): boolean {
    return this.isAlways() ? true : this.isSelected(i);
  }
  isEditableByConfig(i: number): boolean {
    return this.editableSet().has(i);
  }

  isEdgeEditable(i: number): boolean {
    if (!this.enableEdgeEdit()) return false;
    const len = this.definitions().length;
    return len > 0 && (i === 0 || i === len - 1);
  }


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
    if (this.isAlways()) return true;
    const fg = this.getGroup(i);
    return !!fg.controls.selected.value;
  }
  trackByIndex(index: number): number { return index; }

  private emitChange(): void {
    this.coveragesChanged.emit();
    this.changeTick.update(v => v + 1);
  }

  getAmountsFA(i: number): FormArray<FormControl<AmountType>> | null {
    const fg = this.getGroup(i);
    return (fg.controls['amounts'] as FormArray<FormControl<AmountType>> | undefined) ?? null;
  }
  getAmountCtrl(i: number, col: number): FormControl<AmountType> | null {
    const fa = this.getAmountsFA(i);
    return fa ? (fa.at(col) as FormControl<AmountType>) : null;
  }


  getAmountValue(i: number, col: number): number | null {
    const fa = this.getAmountsFA(i);
    if (fa) {
      const v = fa.at(col)?.value ?? null;
      return (typeof v === 'number' && Number.isFinite(v)) ? v : null;
    }
    const def = this.getDefinition(i);
    const t = (def?.tiers as number[] | undefined)?.[col];
    return (typeof t === 'number' && Number.isFinite(t)) ? t : null;
  }


  getDisplayTier(i: number, ti: number, base: number | null): number | null {
    const ov = this.colOverrides()[ti];
    if (i > 0 && ov !== null && Number.isFinite(ov)) return ov;
    return base;
  }

  setAmountValue(i: number, col: number, raw: any): void {
    const v =
      raw === null || raw === '' ? null :
      (typeof raw === 'number' ? (Number.isFinite(raw) ? raw : null) :
       (Number.isFinite(Number(raw)) ? Number(raw) : null));

    let fa = this.getAmountsFA(i);
    if (!fa) {
      const fg = this.getGroup(i);
      const a0 = new FormControl<AmountType>(this.getAmountValue(i, 0));
      const a1 = new FormControl<AmountType>(this.getAmountValue(i, 1));
      const a2 = new FormControl<AmountType>(this.getAmountValue(i, 2));
      fg.addControl('amounts', new FormArray<FormControl<AmountType>>([a0, a1, a2]));
      fa = this.getAmountsFA(i);
    }


    fa!.at(col).setValue(v);

    if (i === 0) {
      const next = [...this.colOverrides()];
      next[col] = v; 
      this.colOverrides.set(next);
    }

    this.emitChange();
  }

  private readonly nf = new Intl.NumberFormat('en-US'); 

  formatAmount(v: number | null): string {
    return v == null ? '' : this.nf.format(v);
  }

  private parseAmount(s: string): number | null {
    const digits = (s ?? '').toString().replace(/[^\d]/g, '');
    if (!digits) return null;
    const n = Number(digits);
    return Number.isFinite(n) ? n : null;
  }

 
  onAmountInput(i: number, col: number, ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const num = this.parseAmount(el.value);
    this.setAmountValue(i, col, num);      
    el.value = this.formatAmount(num);     
  }

 
  chooseTier(i: number, value: string | number): void {
    const v = Number(value);
    const fg = this.getGroup(i);
    fg.controls.amount.setValue(Number.isFinite(v) ? v : null);
    this.emitChange();
  }

  onToggle(i: number): void {
    if (!this.showChecks() || this.isAlways()) return;
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
