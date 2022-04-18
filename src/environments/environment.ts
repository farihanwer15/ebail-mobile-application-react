// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
 //apiUrl: 'http://localhost:8080/api',
     apiUrl:  'https://devapi.ebailapp.com/api',
    // apiUrl: 'https://stageapi.ebailapp.com/api',
  // apiUrl: 'https://c11c580ff215.ngrok.io/api'
  // apiUrl: 'http://v2-backend-dev.us-east-1.elasticbeanstalk.com/api',
  wsUrl: 'wss://c4iznyvfpb.execute-api.us-east-1.amazonaws.com/dev',
  // apiUrl: 'https://api.ebailapp.com',
  testUser: {
    // tslint:disable
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQFVzZXIiLCJyb2xlIjoidXNlciIsIm5iZiI6MTU2NDA2MTQ1NywiZXhwIjoxNTk1NjgzODU3LCJpc3MiOiJpc3N1ZXJfc2FtcGxlIiwiYXVkIjoiYXVkaWVuY2Vfc2FtcGxlIn0.xAAbQIOsw3ZXlIxDFnv5NynZy7OfzrvrJYWsy2NEBbA",
    // tslint:enable
    email: "user@user.user"
  },

  esignAccessToken: '235d382dc4ec4f25ab864924829b0e15',
  plaid: {
    key: '5eb0b45bb0040f64dc684a20d73c61',
    env: 'sandbox'
  },
  version: '2.0.9'
};

// export const environment = {
//   production: false,
//   //apiUrl: 'http://localhost:8081/api',
//    apiUrl: 'https://stageapi.ebailapp.com/api',
//   // apiUrl: 'https://c11c580ff215.ngrok.io/api'
//   // apiUrl: 'http://v2-backend-dev.us-east-1.elasticbeanstalk.com/api',
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
