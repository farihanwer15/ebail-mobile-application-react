import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { UserStore } from '../@store/user.store';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class BillableItemsService {

  apiUrl: string;
  private itemAddedSource = new Subject();
  itemAdded$ = this.itemAddedSource.asObservable();
  
  private itemUpdatedSource = new Subject();
  itemUpdated$ = this.itemAddedSource.asObservable();

  constructor(
    private http: HttpClient,
    private userStore: UserStore
  ) {
    this.apiUrl = environment.apiUrl + '/billable-items';
  }

  addItem(data): Observable<any>{
    return this.http.post(this.apiUrl, data)

  }

  getBillableItems(params = null): Observable<any>{
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

  getBillableItem(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  updateItem(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  deleteItem(id){
    return this.http.delete(this.apiUrl + '/' + id)
   
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error || 'Server error');
  }

  itemAdded(data){
    this.itemAddedSource.next(data);
  }
  
  itemUpdated(data){
    this.itemUpdatedSource.next(data);
  }
}
