import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import TableHeader from '../../interfaces/table/tableHeader';
import TableFilter from '../../interfaces/table/tableFilter';
import TableBulkAction from '../../interfaces/table/tableBulkAction';
import TablePagination from '../../interfaces/table/tablePagination';
import { TableColumnDirective } from '../../directives/table-column.directive';
import { TableCustomFilterDirective } from '../../directives/table-custom-filter.directive';
import {
  CommonModule,
  DecimalPipe,
  NgFor,
  NgIf,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { PropertyPipe } from '../../pipes/property.pipe';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { FormsModule } from '@angular/forms';
import { dateFormats } from '../../constants/dateFormats';

@Component({
    selector: 'shared-table',
    imports: [
        NgIf,
        NgFor,
        NgSwitchCase,
        NgSwitchDefault,
        PropertyPipe,
        DecimalPipe,
        ImageUrlPipe,
        CommonModule,
        FormsModule,
    ],
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements AfterContentInit {
  @ContentChildren(TableColumnDirective)
  columnsTemplates!: QueryList<TableColumnDirective>;
  templatesIndex: { [attribute: string]: TableColumnDirective } = {};

  @ContentChild(TableCustomFilterDirective)
  customFilters!: TableCustomFilterDirective;

  @Input() footerData: (string | number)[][] = [];

  @Input() selectOnClick = false;
  @Input({ required: true }) items!: any[];
  @Input({ required: true }) headers!: TableHeader[];
  @Input() searchPlaceholder!: string;
  @Input() filters?: TableFilter[];
  @Input() bulkActions?: TableBulkAction[];
  @Input() pagination?: TablePagination;
  @Input() noItemsTitle = 'Sin entradas';
  @Input() actionButtonTitle?: string;

  @Input() activeFilter: any = '';

  @Input() loadingExport = false;

  @Output() activeFilterChange = new EventEmitter<any>();
  @Output() exportExcel = new EventEmitter();

  @Output() actionButtonClicked = new EventEmitter();
  @Output() filtered = new EventEmitter<string>();
  @Output() searching = new EventEmitter<string>();
  @Output() endSearching = new EventEmitter<string>();
  @Output() paginatePrev = new EventEmitter();
  @Output() paginateNext = new EventEmitter();
  @Output() itemClicked = new EventEmitter<any>();

  @Input() itemsSelected: any[] = [];
  @Output() itemsSelectedChange = new EventEmitter<typeof this.itemsSelected>();

  @Input() searchValue = '';
  @Output() searchValueChange = new EventEmitter<typeof this.searchValue>();

  searchTimeout: any;
  protected readonly clearTimeout = clearTimeout;
  protected readonly dateFormats = dateFormats;

  ngAfterContentInit() {
    this.columnsTemplates.forEach((t, index) => {
      this.templatesIndex[t.sharedTableColumn] = t;
    });
  }

  handleFilter(value: string) {
    this.activeFilter = value;
    this.activeFilterChange.emit(this.activeFilter);
    this.filtered.emit(value);
  }

  handleSearch($event: KeyboardEvent) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(
      () => this.endSearching.emit(target.value),
      400,
    );

    const target = $event.target as HTMLInputElement;

    this.searching.emit(target.value);
  }

  prevPage() {
    this.paginatePrev.emit();
  }

  nextPage() {
    this.paginateNext.emit();
  }

  selectAll($event: Event) {
    const target = $event.target as HTMLInputElement;

    if (target.checked) {
      this.itemsSelected = [...this.items];
    } else {
      this.itemsSelected = [];
    }

    this.itemsSelectedChange.emit(this.itemsSelected);
  }

  selectItem(item: any) {
    const itemIndex = this.itemsSelected.findIndex((x) => x.id == item.id);

    if (itemIndex == -1) {
      this.itemsSelected.push(item);
    } else {
      this.itemsSelected.splice(itemIndex, 1);
    }

    this.itemsSelectedChange.emit(this.itemsSelected);
  }

  isItemSelected(id: number) {
    return !!this.itemsSelected.find((x) => x.id == id);
  }

  handleItemClicked(item: any) {
    if (this.selectOnClick) {
      this.selectItem(item);
    } else {
      this.itemClicked.emit(item);
    }
  }

  async handleActionClicked(action: TableBulkAction) {
    await action.callback(this.itemsSelected);

    this.itemsSelected = [];
  }

  getItemClass(header: TableHeader, item: any) {
    if (!header.class) return;

    if (typeof header.class == 'string') return header.class;

    return header.class(item);
  }
}
