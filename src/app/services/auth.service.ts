import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { UserStore } from '../@store/user.store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl;
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private userStore: UserStore,
  ) {
    this.apiUrl = environment.apiUrl + '/auth';
  }

  login(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  
  updateDarkmode(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/update-mode`, data);
  }

  verifyCode(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/verify-code`, data);
  }

  resendCode(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/resend-code`, data);
  }

  requestPasswordReset(data){
    return this.http.post(`${this.apiUrl}/request-password-reset`, data);
  }

  verifyPassConfirmationCode(data){
    return this.http.post(`${this.apiUrl}/verify-pass-confirmation-code`, data);
  }

  errorHandler(errorRes: HttpErrorResponse) {
    return Observable.throw(errorRes.error || 'Server error');
  }

  async logout(){
    this.userStore.setUser(undefined);
    await this.storage.clear();
  }
}
