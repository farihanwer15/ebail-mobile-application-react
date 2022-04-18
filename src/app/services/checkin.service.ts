import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { UserStore } from "../@store/user.store";


const qs = require('qs');
@Injectable({
  providedIn: 'root'
})
export class CheckinService {

  
  apiUrl: string;
  private itemAddedSource = new Subject();
  checkinAdded$ = this.itemAddedSource.asObservable();
  
  private itemUpdatedSource = new Subject();
  checkinUpdated$ = this.itemAddedSource.asObservable();

  constructor(
    private http: HttpClient,
    private userStore: UserStore
  ) {
    this.apiUrl = environment.apiUrl + '/checkins';
  }

  addCheckin(data): Observable<any>{
    return this.http.post(this.apiUrl, data)
    
  }

  getCheckins(params = null): Observable<any>{
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

  getCheckin(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
  }

  updateCheckin(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
   
  }

  markAsCheckedIn(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/mark-as-checkedin`, data)
   
  }

  resendReminder(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/resend-reminder`, data)
   
  }

  cancelCheckin(id){
    return this.http.delete(`${this.apiUrl}/cancel-checkin/${id}`)
   
  }
  
  deleteCheckin(id){
    return this.http.delete(`${this.apiUrl}/${id}`)
   
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error || 'Server error');
  }

  checkinAdded(data){
    this.itemAddedSource.next(data);
  }
  
  checkinUpdated(data){
    this.itemUpdatedSource.next(data);
  }
}
