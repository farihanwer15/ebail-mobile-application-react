import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl;
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/users';
  }
  getCurrent(): Observable<any>{
    return this.http.get(`${this.apiUrl}/current`);
  }

}
