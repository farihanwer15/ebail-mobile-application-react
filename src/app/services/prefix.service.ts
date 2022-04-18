import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class PrefixService {

  apiUrl: string;
  private prefixAddedSource = new Subject();
  prefixAdded$ = this.prefixAddedSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/prefixes';
  }

  addPrefix(prefix){
    return this.http.post(this.apiUrl, prefix)
    
  }

  getPrefixes(params = null): Observable<any>{

    let query = '';
    if (params) {
      query = qs.stringify(params);
    }

    return this.http.get(this.apiUrl + '?' + query)
    
  }

  updatePrefix(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  getPrefix(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  deletePrefix(id){
    return this.http.delete(this.apiUrl + '/' + id)
    
  }

  errorHandler(errorRes: HttpErrorResponse){
    let errors = [];
    errorRes.error.details.forEach(error => {
      errors.push(error.message);
    });

    return Observable.throw(errors);
  }

  prefixAdded(data){
    this.prefixAddedSource.next(data);
  }
}
