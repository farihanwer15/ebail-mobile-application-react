import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatesService {

  apiUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/states';
  }

  getStates(): Observable<any>{
    return this.http.get(this.apiUrl);
  }

  errorHandler(error: HttpErrorResponse){

    return Observable.throw(error || 'Server error');
  }

}
