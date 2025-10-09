import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
  NgbCarouselModule,
  NgbDropdownModule,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ViewHeaderComponent } from './components/view-header/view-header.component';
import { FormInputDirective } from './directives/form-input.directive';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { LocalPaginationService } from './services/local-pagination.service';
import { DetailFormContainerComponent } from './components/detail-form-container/detail-form-container.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabContentDirective } from './directives/tab-content.directive';
import BaseListComponent from './components/base-list/base-list.component';
import { FileDropComponent } from './components/file-drop/file-drop.component';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { ProfileImagePipe } from './pipes/profile-image.pipe';
import { TableDateFilterComponent } from './components/table-date-filter/table-date-filter.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { SearchModalComponent } from './components/search-modal/search-modal.component';

@NgModule({
  declarations: [
    ViewHeaderComponent,
    FormInputDirective,
    DetailFormContainerComponent,
    TabsComponent,
    TabContentDirective,
    FileDropComponent,
    ProfileImagePipe,
    DateAgoPipe,
    TableDateFilterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgbDropdownModule,
    NgxFileDropModule,
    SearchModalComponent
  ],
  providers: [provideNgxMask(), LocalPaginationService],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgbCarouselModule,
    ViewHeaderComponent,
    FormInputDirective,
    NgxMaskDirective,
    NgxMaskPipe,
    NgbDropdownModule,
    DetailFormContainerComponent,
    ProfileImagePipe,
    TabsComponent,
    TabContentDirective,
    FileDropComponent,
    DateAgoPipe,
    TableDateFilterComponent,
    SearchModalComponent
  ],
})
export class SharedModule {}
