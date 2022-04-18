import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

const qs = require('qs');

import 'rxjs/add/observable/throw';

@Injectable({
  providedIn: 'root'
})

export class OfficeService {

  apiUrl: string;
  private officeAddedSource = new Subject();
  officeAdded$ = this.officeAddedSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/offices';
  }

  addOffice(office): Observable<any>{
    return this.http.post(this.apiUrl, office)
    
  }

  getOffices(params = null): Observable<any>{
    let query = qs.stringify(params);
    
    return this.http.get<any>(`${this.apiUrl}?${query}`)
  }

  updateOffice(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  getOffice(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  deleteOffice(id){
    return this.http.delete(this.apiUrl + '/' + id)
    
  }

  errorHandler(errorRes: HttpErrorResponse){
    let errors = [];
    errorRes.error.details.forEach(error => {
      errors.push(error.message);
    });

    return Observable.throw(errors);
  }

  officeAdded(data){
    this.officeAddedSource.next(data);
  }

}
