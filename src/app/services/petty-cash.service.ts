import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { UserStore } from '../@store/user.store';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class PettyCashService {

  apiUrl: string;
  private pettyCashAddedSource = new Subject();
  pettyCashAdded$ = this.pettyCashAddedSource.asObservable();
  
  constructor(
    private http: HttpClient,
    private userStore: UserStore
  ) {
    this.apiUrl = environment.apiUrl + '/petty-cash';
  }

  addPettyCash(data): Observable<any>{
    return this.http.post(this.apiUrl, data)
  
  }

  getAllPettyCash(params = null): Observable<any>{
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

  getPettyCash(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  updatePettyCash(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)

  }

  deletePettyCash(id){
    return this.http.delete(this.apiUrl + '/' + id)
   
  }

  getStats(params = null): Observable<any>{
    let query = qs.stringify(params);
    return this.http.get(this.apiUrl + '/stats?' + query)
    
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error || 'Server error');
  }

  pettyCashAdded(data = null){
    this.pettyCashAddedSource.next(data);
  }
  
}
