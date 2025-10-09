import {Injectable} from '@angular/core';
import {io, Socket} from "socket.io-client";
import { environment } from "../../../environments/environment";
import {CarWashService} from "../../features/car-washes/services/car-wash.service";

@Injectable({
  providedIn: 'root'
})
export class SocketService{
  socket!: Socket<any>

  constructor(private carWashService: CarWashService) {
    this.carWashService.carWashSubject.subscribe(() => {
      if (this.carWashService.activeCarWash){
        this.socket = io(environment.serverHost.replace('/carpro/', ''), {
          path: environment.socketPath,
          reconnection: true,
          query: {carWashId: this.carWashService.activeCarWash.id
          }
        })
      }
    })
  }
}