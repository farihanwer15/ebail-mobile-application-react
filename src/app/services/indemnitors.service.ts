import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class IndemnitorsService {

  
  apiUrl: string;
  private indemnitorAddedSource = new Subject();
  indemnitorAdded$ = this.indemnitorAddedSource.asObservable();
  
  private getBondIndemsSource = new Subject();
  getBondIndemnitors$ = this.getBondIndemsSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/users';
  }
  
  addIndemnitor(data): Observable<any>{
    return this.http.post(this.apiUrl, data);
  }

  updateIndemnitor(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data);
  }

  getIndemnitors(params = null): Observable<any>{
    
    let roles = {
      indemnitor: true,
    }
    
    let query = '';

    if(!params){
      params = {
        roles: roles
      }
    }
    else if(params){
      params.roles = roles;
    }
    query = qs.stringify(params);
    
    return this.http.get(this.apiUrl + '?' + query);
  }

  getIndemnitor(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id);
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error || 'Server error');
  }

  indemnitorAdded(data){
    this.indemnitorAddedSource.next(data);
  }

  getBondIndemnitors(bondId){
    this.getBondIndemsSource.next(bondId);
  }
}
