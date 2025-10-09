export const environment = {
  socketPath: '/socket.io',
  serverHost: 'https://lacolonial.com.do/',
  mapsKey: 'AIzaSyDjZu-yR3TJwMWpwXEPpis6s0xBMCUYs6I',
  msalConfig: {
    auth: {
      clientId: '8cacca3e-8507-4566-96f5-14ede5d009d1',
    },
  },
  apiConfig: {
    scopes: [
      'offline_access',
      'openid',
      'https://loginlacolonial.onmicrosoft.com/b371cea0-25d3-4fb7-accc-47394a498642/MovilAPI.Read',
      'https://loginlacolonial.onmicrosoft.com/b371cea0-25d3-4fb7-accc-47394a498642/MovilAPI.ReadWrite',
    ],
    uri: '',
  },
  b2cPolicies: {
    names: {
      signUpSignIn: 'B2C_1_SignIn',
      signUp: 'B2C_1_SignupClient',
      resetPassword: 'B2C_1_password_reset',
      editProfile: 'B2C_1_profile_edit',
    },
    authorities: {
      signUpSignIn: {
        authority:
          'https://loginlacolonial.b2clogin.com/loginlacolonial.onmicrosoft.com/B2C_1_SignIn',
      },
      signUp: {
        authority:
          'https://loginlacolonial.b2clogin.com/loginlacolonial.onmicrosoft.com/B2C_1_SignupClient',
      },
      resetPassword: {
        authority:
          'https://loginlacolonial.b2clogin.com/loginlacolonial.onmicrosoft.com/B2C_1_password_reset',
      },
      editProfile: {
        authority:
          'https://loginlacolonial.b2clogin.com/loginlacolonial.onmicrosoft.com/B2C_1_profile_edit',
      },
    },
    authorityDomain: 'loginlacolonial.b2clogin.com',
  },
  paymentRoute: 'https://EpaymentProxyAPI.lacolonial.com.do/api/',
  claimsRoute: 'https://DigitalClaimAPI.lacolonial.com.do/api/',
  apiRoute: 'https://lacolonialservicesmobile.lacolonial.com.do/api/',
  identityRoute: 'https://login.lacolonial.com.do/',
  cmsRoute: 'wp-json/wp/v2/',
};
