import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class PowersService {

  apiUrl: string;
  private powerAddedSource = new Subject();
  powerAdded$ = this.powerAddedSource.asObservable();
  
  private powerAssignedSource = new Subject();
  powerAssigned$ = this.powerAssignedSource.asObservable();

  private powerAcceptedSource = new Subject();
  powerAccepted$ = this.powerAcceptedSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/powers';
  }

  addPower(power): Observable<any>{
    return this.http.post(this.apiUrl, power);
  }

  updatePower(id, data){
    return this.http.put(this.apiUrl + '/' + id, data);
  }

  getPowers(params = null): Observable<any>{

    let query = qs.stringify(params);

    return this.http.get(this.apiUrl + '?' + query);
  }

  getPowersStats(params = null): Observable<any>{

    let query = qs.stringify(params);

    return this.http.get(`${this.apiUrl}/stats?${query}`)
  }

  deletePower(id){
    return this.http.delete(this.apiUrl + '/' + id);
  }

  unassignPower(id){
    return this.http.put(this.apiUrl + '/unassign-power/' + id, {});
  }

  unvoidPower(id){
    return this.http.put(this.apiUrl + '/unvoid-power/' + id, {});
  }

  acceptMultiplePowers(powerIds): Observable<any>{
    return this.http.post(`${this.apiUrl}/accept-multiple-powers`, powerIds);
  }

  errorHandler(errorRes: HttpErrorResponse){
    let errors = [];
    errorRes.error.details.forEach(error => {
      errors.push(error.message);
    });

    return Observable.throw(errors);
  }

  powerAdded(data){
    this.powerAddedSource.next(data);
  }

  powerAccepted(){
    this.powerAcceptedSource.next();
  }

  powerAssigned(){
    this.powerAssignedSource.next();
  }
}
