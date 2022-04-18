import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class SuretyService {

  apiUrl: string;
  private suretyAddedSource = new Subject<any>();

  suretyAdded$ = this.suretyAddedSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/sureties';
  }

  addSurety(surety){
    return this.http.post(this.apiUrl, surety)
    
  }

  getSureties(params = null): Observable<any>{

    let query = qs.stringify(params);
    return this.http.get(this.apiUrl + '?' + query)
    
  }

  updateSurety(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  getSurety(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  deleteSurety(id){
    return this.http.delete(this.apiUrl + '/' + id)
    
  }

  errorHandler(errorRes: HttpErrorResponse){
    let errors = [];
    errorRes.error.details.forEach(error => {
      errors.push(error.message);
    });

    return Observable.throw(errors);
  }

  suretyAdded(data){
    this.suretyAddedSource.next(data);
  }

}
