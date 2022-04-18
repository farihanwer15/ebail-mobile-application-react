import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class CourtDatesService {

  apiUrl: string;
  private courtDateAddedSource = new Subject();
  courtDateAdded$ = this.courtDateAddedSource.asObservable();

  private getBondCourtDatesSource = new Subject();
  getBondCourtDates$ = this.getBondCourtDatesSource.asObservable();

  
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/bond-court-dates';
  }

  
  addCourtDate(data): Observable<any>{
    return this.http.post(this.apiUrl, data);
  }

  updateCourtDate(courtId, data): Observable<any>{
    return this.http.put(this.apiUrl + "/" + courtId, data);
  }

  getCourtDates(params = null): Observable<any>{

    let query = qs.stringify(params);
    
    return this.http.get(this.apiUrl + '?' + query);
  }

  getCourtDate(id): Observable<any>{

    return this.http.get(this.apiUrl + '/' + id);
  }

  deleteCourtDate(bondId, courtDateId){
    return this.http.delete(`${this.apiUrl}/${bondId}/${courtDateId}`)
  }

  courtDateAdded(data = null){
    this.courtDateAddedSource.next(data);
  }

  getBondCourtDates(bondId){
    this.getBondCourtDatesSource.next(bondId);
  }
}
