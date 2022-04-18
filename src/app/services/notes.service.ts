import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  apiUrl: string;
  private noteAddedSource = new Subject();
  noteAdded$ = this.noteAddedSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/notes';
  }

  addNote(note){
    return this.http.post(this.apiUrl, note);
  }

  updateNote(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data);
  }

  getNote(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id);
  }

  deleteNote(id){
    return this.http.delete(this.apiUrl + '/' + id);
  }

  getNotes(params = null): Observable<any>{
    let query = qs.stringify(params);
    
    return this.http.get(this.apiUrl + '?' + query);
  }

  errorHandler(errorRes: HttpErrorResponse) {
    return Observable.throw(errorRes.error || 'Server error');
  }

  noteAdded(type) {
    this.noteAddedSource.next(type);
  }

}
