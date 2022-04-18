import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  
  apiUrl: string;
  private invoicesSavedSource = new Subject();
  invoicesSaved$ = this.invoicesSavedSource.asObservable();
  
  private invoiceAddedSource = new Subject();
  invoiceAdded$ = this.invoiceAddedSource.asObservable();
  
  private getBondInvoicesSource = new Subject();
  getBondInvoices$ = this.getBondInvoicesSource.asObservable();
  
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/invoices';
  }

  addInvoices(invoices){
    return this.http.post(this.apiUrl, invoices)
  }

  addSingleInvoice(invoice){
    return this.http.post(this.apiUrl + '/invoice', invoice)
      
  }

  mergeInvoices(invoice){
    return this.http.post(this.apiUrl + '/merge-invoices', invoice)
      
  }

  splitInvoice(invoices){
    return this.http.post(this.apiUrl + '/split-invoice', invoices)
      
  }

  generatePremiumReceipt(data){
    return this.http.post(this.apiUrl + '/generate-premium-receipt', data)
      
  }

  getInvoices(params = null): Observable<any>{
    let query = qs.stringify(params);
    
    return this.http.get(this.apiUrl + '?' + query)
      
  }

  updateInvoice(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
    
  }

  getInvoice(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
    
  }

  deleteInvoice(id){
    return this.http.delete(this.apiUrl + '/' + id)
  }

  cancelInvoices(data){
    return this.http.post(this.apiUrl + '/cancel-invoices', data);
  }

  errorHandler(errorRes: HttpErrorResponse) {
    return Observable.throw(errorRes.error || 'Server error');
  }  

  getHostingPaymentPage(invoiceId): Observable<any>{
    return this.http.get(this.apiUrl + '/hpp/' + invoiceId, {
      responseType: 'text'
    })
    
  }

  // EVENTS FUNCTIONS
  invoicesSaved(data = null) {
    this.invoicesSavedSource.next(data);
  }

  getBondInvoices(bondId){
    return this.getBondInvoicesSource.next(bondId);
  }

  invoiceAdded(data = null) {
    this.invoiceAddedSource.next(data);
  }
}
