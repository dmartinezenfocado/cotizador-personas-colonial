import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject, Subscriber, Subscription} from "rxjs";

@Injectable()
export class LocalPaginationService<T>{
  private currentDataSource = new Subject<T[]>()
  private $currentDataObservable = this.currentDataSource.asObservable()
  private currentDataSubscription: Subscription | undefined

  private currentData: T[] = []
  totalPages: number = 0
  pageSize: number = 7
  currentPage: number = 0

  get data(){
    return JSON.parse(JSON.stringify(this.currentData))
  }

  set data(data: T[]){
    this.currentDataSource.next(data)
  }

  get currentPageData(){
    const sliceStart = this.pageSize * (this.currentPage - 1)
    const sliceEnd = this.pageSize * this.currentPage

    const result = this.currentData.slice(sliceStart, sliceEnd)

    return result
  }

  constructor() {
    this.currentDataSubscription = this.$currentDataObservable.subscribe(data =>{
      this.currentPage = data.length ? 1 : 0

      this.currentData = data
      this.totalPages = Math.ceil(data.length / this.pageSize)
    })
  }

  nextPage(){
    if (this.currentPage < this.totalPages)
      this.currentPage += 1
  }

  prevPage(){
    if (this.currentPage > 1)
      this.currentPage -= 1
  }
}
