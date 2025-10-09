// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Subject } from 'rxjs';
// import User from '../../../core/data/models/user.model';
// import { MsalService } from '@azure/msal-angular';
// import { AccountInfo, SilentRequest } from '@azure/msal-browser';
// import { environment } from '../../../../environments/environment';
// import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

// @Injectable()
// export class AuthService {
//   jwt: string = '';
//   account?: AccountInfo;
//   private $logout = new Subject<void>();
//   _logout = this.$logout.asObservable();
//   private $login = new Subject<void>();
//   _login = this.$login.asObservable();
//   private authTokenSubject = new BehaviorSubject<string | null>(null);
//   authToken$ = this.authTokenSubject.asObservable();

//   constructor(
//     private router: Router,
//     protected httpClient: HttpClient,
//     private msalService: MsalService,
//   ) {
//     this.msalService.initialize().subscribe(() => {
//       this.getAccount();
//       this.getToken();
//     });
//   }

//   private _user!: User;

//   userSubject = new BehaviorSubject<User>(this._user);

//   get user() {
//     return this._user;
//   }

//   set user(user: User) {
//     this._user = user;

//     this.userSubject.next(user);
//   }

//   get isClient() {
//     return this.user.idTokenClaims?.extension_IdNumber;
//   }

//   get isIntermediary() {
//     return this.user.idTokenClaims?.extension_ProducerNumber;
//   }

//   get home() {
//     return '';
//   }

//   setAuthToken(token: string | null) {
//     this.authTokenSubject.next(token);
//   }

//   async logOut() {
//     this.msalService.logout();
//     this.jwt = '';
//     this.user = undefined as any;
//     this.$logout.next();
//   }

//   private getAccount() {
//     if (this.msalService.instance.getAllAccounts().length == 0) return;

//     this.account = this.msalService.instance.getAllAccounts()[0];

//     this.user = this.account as User;
//   }

//   private async getToken() {
//     if (!this.msalService || !this.account) return;

//     const tokenRequest: SilentRequest = {
//       account: this.account,
//       scopes: environment.apiConfig.scopes,
//     };

//     try {
//       const response =
//         await this.msalService.instance.acquireTokenSilent(tokenRequest);
//       this.user = {
//         ...this.user,
//         accessToken: response.accessToken,
//         expiresOn: response.expiresOn,
//       };
//       this.setAuthToken(response.accessToken);
//       if (this.isClient) {
//         this.getMe();
//       }
//     } catch (e) {
//       console.error('Failed to get access token silently', e);
//       this.logOut();
//     }
//   }

//   private async getMe() {
//     const result: any = await lastValueFrom(
//       this.httpClient.get(
//         'clients?idNumber=' + this.user.idTokenClaims?.extension_IdNumber,
//       ),
//     );
//     this.user = {
//       ...this.user,
//       phone: result.data.phone.replace(/\D/g, ''),
//     };
//   }

//   async refreshToken(): Promise<string | null> {
//     if (!this.account) return null;

//     const tokenRequest: SilentRequest = {
//       account: this.account,
//       scopes: environment.apiConfig.scopes,
//     };

//     try {
//       const response =
//         await this.msalService.instance.acquireTokenSilent(tokenRequest);
//       this.user = {
//         ...this.user,
//         accessToken: response.accessToken,
//         expiresOn: response.expiresOn,
//       };
//       this.setAuthToken(response.accessToken);
//       return response.accessToken;
//     } catch (error) {
//       console.error('Error trying to refresh token silently', error);
//       return null;
//     }
//   }
// }
