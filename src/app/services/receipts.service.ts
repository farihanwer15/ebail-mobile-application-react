import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptsService {

  
  apiUrl: string;
  private receiptAddedSource = new Subject();
  receiptAdded$ = this.receiptAddedSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/receipts';
  }

  addReceipt(receipt){
    return this.http.post(this.apiUrl, receipt);
  }

  uploadFiles(formData){
    return this.http.post(this.apiUrl + '/upload-files', formData );
  }

  getReceipts(params = null): Observable<any>{

    let query = '';
    if (params) {
      query = qs.stringify(params);
    }

    return this.http.get(this.apiUrl + '?' + query);
  }
  
  getPresignedUrl(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/get-presigned-url/`, data);
  }

  updateReceipt(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data);
  }

  getReceipt(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id);
  }

  deleteReceipt(id){
    return this.http.delete(this.apiUrl + '/' + id);
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error);
  }

  receiptAdded(data){
    this.receiptAddedSource.next(data);
  }
}
