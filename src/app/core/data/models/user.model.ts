import { AccountInfo, IdTokenClaims } from '@azure/msal-browser';

export default interface User extends AccountInfo {
  idTokenClaims?: IdTokenClaims & {
    extension_IdNumber?: string;
    extension_ProducerNumber?: number;
    given_name: string;
  };
  accessToken: string;
  expiresOn: Date | null;
  phone: string;
}
