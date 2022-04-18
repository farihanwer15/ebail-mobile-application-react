import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  apiUrl: string;
  private staffAddedSource = new Subject();
  staffAdded$ = this.staffAddedSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/users';
  }

  addStaffMember(data): Observable<any>{
    return this.http.post(this.apiUrl, data)
    
  }

  getStaffMembers(params = null): Observable<any>{

    let query = '';

    let roles = {
      agencyManager: true,
      officeManager: true,
      generalAgent: true,
      subAgent: true,
      recoveryAgent: true,
      agencyOwner: true
    }
    if(!params){
      params = {
        roles: roles
      }
    }
    else if(!params.roles){
      params.roles = roles;
    }
    query = qs.stringify(params);
    
    return this.http.get(this.apiUrl + '?' + query)
    
  }

  getGeneralAgents(): Observable<any>{
    return this.http.get(this.apiUrl + '?roles[generalAgent]=true')
    
  }
  
  updateMember(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  getMember(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  deleteMember(id){
    return this.http.delete(this.apiUrl + '/' + id)
    
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error || 'Server error');
  }

  staffAdded(data){
    this.staffAddedSource.next(data);
  }
}
