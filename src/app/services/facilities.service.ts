import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import * as qs from 'qs';
import { UserStore } from '../@store/user.store';

@Injectable({
  providedIn: 'root'
})
export class FacilitiesService {

  apiUrl: string;
  private facilityAddedSource = new Subject();
  facilityAdded$ = this.facilityAddedSource.asObservable();

  constructor(
    private http: HttpClient,
    private userStore: UserStore
  ) {
    this.apiUrl = environment.apiUrl + '/facilities';
  }

  addFacility(data): Observable<any>{
    return this.http.post(this.apiUrl, data)
     
  }
  
  updateFacility(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  getFacility(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  deleteFacility(id){
    return this.http.delete(this.apiUrl + '/' + id)
    
  }

  getFacilites(params = null): Observable<any>{
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

  facilityAdded(data){
    this.facilityAddedSource.next(data);
  }
}
