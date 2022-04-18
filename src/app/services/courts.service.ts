import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { UserStore } from '../@store/user.store';

import * as qs from 'qs'

@Injectable({
  providedIn: 'root'
})
export class CourtsService {

  apiUrl: string;
  private courtAddedSource = new Subject();
  courtAdded$ = this.courtAddedSource.asObservable();

  constructor(
    private http: HttpClient,
    private userStore: UserStore
  ) {
    this.apiUrl = environment.apiUrl + '/courts';
  }

  addCourt(data): Observable<any>{
    return this.http.post(this.apiUrl, data)
    
  }

  updateCourt(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  getCourt(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  deleteCourt(id){
    return this.http.delete(this.apiUrl + '/' + id)
    
  }

  getCourts(params = null): Observable<any>{
    let query = '';

    params = {
      ...params, 
      agencyId: this.userStore.getUser().agencyId
    };

    if(params){
      query = qs.stringify(params);
    }
    
    return this.http.get(this.apiUrl + '?' + query)
    
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error || 'Server error');
  }

  courtAdded(data){
    this.courtAddedSource.next(data);
  }
}
