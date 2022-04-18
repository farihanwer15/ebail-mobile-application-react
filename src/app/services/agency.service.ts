import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class AgencyService {

  apiUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/agencies';
  }

  addAgency(agency) : Observable<any>{
    return this.http.post(this.apiUrl, agency);
  }

  getSubAgencies(params) : Observable<any>{
    let query = qs.stringify(params);
    return this.http.get(`${this.apiUrl}/sub-agencies?${query}`);
  }
  updateAgency(id, data){
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getAgency(id): Observable<any>{
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAgencyStats(id, params = null): Observable<any>{
    
    let query = qs.stringify(params);
    return this.http.get(`${this.apiUrl}/${id}/stats?${query}`);
  }

  getAgencyAccountStats(id, params = null): Observable<any>{
    
    let query = qs.stringify(params);
    return this.http.get(`${this.apiUrl}/${id}/account-stats?${query}`);
  }

  getUserAgency(): Observable<any>{
    return this.http.get<any>(this.apiUrl + '');
  }
}
