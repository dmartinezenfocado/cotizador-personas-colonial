import { Injectable } from '@angular/core';
import TablePagination from "../interfaces/table/tablePagination";

@Injectable()
export class HttpPaginationService {
  pagination: TablePagination = {totalPages: 1, currentPage: 1}

  get paginationFilter(){
    return {
      pagination: {
        page: this.pagination.currentPage,
        pageSize: 15
      }
    }
  }

  nextPage() {
    this.pagination.currentPage += 1
  }

  prevPage() {
    this.pagination.currentPage -= 1
  }

  constructor() { }
}
