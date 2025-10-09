import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertOptions } from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class SwalService {

  error(message: string, icon: SweetAlertIcon = 'error' ){
    Swal.fire({
      title: 'La Colonial',
      html: message,
      icon
    })
  }

  confirm(message: string, title?: string){
    return Swal.fire({
      title: title,
      html: message,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    })
  }

  showLoading(message?: string){
    Swal.fire({
      html: message,
      allowOutsideClick: false,
      didOpen() {
        Swal.showLoading()
      }
    })
  }

  success(message?: string, options?: SweetAlertOptions){
    return Swal.fire({
      html: message,
      icon: 'success',
      didOpen() {
        Swal.hideLoading()
      },
      ...options
    })
  }

  dismiss(){
    Swal.close()
  }
}
