import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { UserStore } from '../@store/user.store';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ChargesService {

  apiUrl: string;
  private chargeAddedSource = new Subject();
  chargeAdded$ = this.chargeAddedSource.asObservable();

  constructor(
    private http: HttpClient,
    private userStore: UserStore
  ) {
    this.apiUrl = environment.apiUrl + '/charges';
  }

  addCharge(data): Observable<any>{
    return this.http.post(this.apiUrl, data)
     
  }

  updateCharge(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  getCharge(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
  }

  deleteCharge(id){
    return this.http.delete(this.apiUrl + '/' + id)
    
  }

  getCharges(params = null): Observable<any>{
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

  chargeAdded(data){
    this.chargeAddedSource.next(data);
  }
}
