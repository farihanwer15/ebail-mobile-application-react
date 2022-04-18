import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import * as qs from 'qs';
import { UserStore } from '../@store/user.store';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  apiUrl: string;
  
  private refreshLogsSource = new Subject();
  refreshLogs$ = this.refreshLogsSource.asObservable();

  constructor(
    private http: HttpClient,
    private userStore: UserStore
  ) {
    this.apiUrl = environment.apiUrl + '/logs';
  }

  getLogs(params = null): Observable<any>{
    let query = '';

    params = {
      ...params,
      officeId: this.userStore.getUser().office ? this.userStore.getUser().office._id : undefined
    };

    if(params){
      query = qs.stringify(params);
    }
    
    return this.http.get(this.apiUrl + '?' + query);
  }

  refreshLogs(){
    this.refreshLogsSource.next();
  }
}
