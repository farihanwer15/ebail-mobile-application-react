import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PublicService {

  apiUrl: string;
  constructor(
    private http: HttpClient,
    private handler: HttpBackend
  ) {
    this.apiUrl = environment.apiUrl + '/public';
  }

  getZiftTempPassword(data) {
    return this.http.post(`${this.apiUrl}/zift-temp-pass`, data)
  }

  proxynization(accountNumber, password, callback) {
    this.http = new HttpClient(this.handler);
    callback = this.escapeHtml(callback);
    console.log('Callback', callback);


    return this.http.post(`https://sandbox-secure.zift.io/services/proxynization`,
      `accountNumber=${this.escapeHtml(accountNumber)}&callback=${callback}&password=${password}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }).pipe(
        tap((res) => {

          console.log('response in tap', res);
        })
      )
  }

  getCheckin(checkinId): Observable<any> {
    return this.http.get(`${this.apiUrl}/checkin/${checkinId}`)
  }

  testPipe(response) {
    return response
  }

  escapeHtml(unsafe) {
    console.log('unsgae', typeof unsafe);
    if (typeof unsafe == "string") {
      return ('' + unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    } else {
      return ('' + unsafe)
    }
  }
}
