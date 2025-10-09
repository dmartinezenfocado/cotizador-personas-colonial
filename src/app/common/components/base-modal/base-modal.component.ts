import { Component, OnDestroy } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";

@Component({
  selector: 'shared-base-modal',
  template: '',
})
export default abstract class BaseModalComponent implements OnDestroy{
  abstract modal: NgbModalRef
  onDismiss?: () => void

  fullscreen = false
  size?: 'sm' | 'lg' | 'xl' | string;

  private dismissSubscription?: Subscription

  constructor(
    private modalService: NgbModal
  ) {}

  ngOnDestroy() {
    this.dismissSubscription?.unsubscribe()
  }

  open(){
    this.dismissSubscription = this.modalService.open(this.modal, {centered: true, fullscreen: this.fullscreen, size: this.size}).dismissed.subscribe(()=>{
      if (this.onDismiss)
        this.onDismiss()

      this.dismissSubscription?.unsubscribe()
    })
  }

  close(){
    this.modalService.dismissAll()
  }
}
