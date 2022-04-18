import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class DefendantsService {

  apiUrl: string;
  private defendantAddedSource = new Subject();
  defendantAdded$ = this.defendantAddedSource.asObservable();

  private indemnitorsAddedSource = new Subject();
  indemnitorsAdded$ = this.indemnitorsAddedSource.asObservable();
  
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/users';
  }
  addIndemnitor(defId, data){
    return this.http.post(`${this.apiUrl}/indemnitors/${defId}`, data)
  }
  updateIndemnitor(defId, indemId, data){
    return this.http.put(`${this.apiUrl}/indemnitors/${defId}/${indemId}`, data);
  }
  updateCustodyStatus(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/update-custody-status/`, data)
  }
  addDefendant(data): Observable<any>{
    return this.http.post(this.apiUrl, data);
  }
  getDefendantsStats(params = null): Observable<any>{
    let query = qs.stringify(params);
    return this.http.get(`${this.apiUrl}/defendants-stats?${query}`)
  }
  startMonitoring(id): Observable<any>{
    return this.http.get(`${this.apiUrl}/start-monitoring/${id}`)
  }
  removeAvatar(defId){
    return this.http.delete(`${this.apiUrl}/remove-avatar/${defId}`)
    
  }
  uploadAvatar(file, userId){
    return this.http.post(`${this.apiUrl}/upload-avatar/${userId}`, file)
  }


  updateDefendant(id, data){
    return this.http.put(this.apiUrl + '/' + id, data);
  }

  deleteIndemnitor(defId, indemId) {
    return this.http.delete(`${this.apiUrl}/indemnitors/${defId}/${indemId}`)
  }

  getDefendant(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id);
  }

  getDefendants(params = null): Observable<any>{
    let query = '';

    params = {...params, roles: {
      defendant: true
    }};

    if(params){
      query = qs.stringify(params);
    }
    
    return this.http.get(this.apiUrl + '?' + query);
  }

  defendantAdded(data){
    this.defendantAddedSource.next(data);
  }
  indemnitorsAdded(data){
    this.indemnitorsAddedSource.next(data);
  }
}
