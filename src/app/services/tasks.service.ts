import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

    
  apiUrl: string;
  private taskAddedSource = new Subject();
  taskAdded$ = this.taskAddedSource.asObservable();

  constructor(
    private http: HttpClient,
  ) {
    this.apiUrl = environment.apiUrl + '/tasks';
  }
  
  addTask(data): Observable<any>{
    return this.http.post(this.apiUrl, data);
  }

  getTasks(params = null): Observable<any>{
    let query = qs.stringify(params);;
    return this.http.get(this.apiUrl + '?' + query);
  }

  getTask(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id);
  }

  updateTask(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data);
  }

  restoreTask(id): Observable<any>{
    return this.http.put(this.apiUrl + '/restore/' + id, {});
  }

  deleteTask(id){
    return this.http.delete(this.apiUrl + '/' + id);
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error || 'Server error');
  }

  taskAdded(data){
    this.taskAddedSource.next(data);
  }
  
}
