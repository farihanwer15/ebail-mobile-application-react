import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
const qs = require('qs');

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  apiUrl: string;
  
  private paymentAddedSource = new Subject();
  paymentAdded$ = this.paymentAddedSource.asObservable();

  private paymentVoidedSource = new Subject();
  paymentVoided$ = this.paymentVoidedSource.asObservable();
  
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/payments';
  }

  makePayment(payment){
    return this.http.post(`${this.apiUrl}/make-payment`, payment)
     
  }

  addPayment(payment){
    return this.http.post(this.apiUrl, payment)
     
  }

  attachPaymentToInvoice(data){
    return this.http.post(`${this.apiUrl}/attach-invoice`, data)
     
  }
  
  markAsPaid(payment){
    return this.http.post(`${this.apiUrl}/mark-as-paid`, payment)
     
  }
  
  getPayments(params = null): Observable<any>{
    let query = qs.stringify(params);
    
    return this.http.get(this.apiUrl + '?' + query)
     
  }

  getPaymentStats(params = null): Observable<any>{
    let query = qs.stringify(params);
    
    return this.http.get(`${this.apiUrl}/stats?${query}`)
     
  }

  updatePayment(id, data): Observable<any>{
    return this.http.put(this.apiUrl + '/' + id, data)
   
  }

  getPayment(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
   
  }

  deletePayment(id){
    return this.http.delete(this.apiUrl + '/' + id)
   
  }

  getZiftTransactionData(paymentId){
    return this.http.get(`${this.apiUrl}/zift-transaction-data/${paymentId}`)
   
  }
  generateStatements(data): Observable<any>{
    return this.http.post(`${this.apiUrl}/download-statement`, data)
    
  }

  voidRefundInvoice(data){
    return this.http.post(`${this.apiUrl}/void-refund`, data)
   
  }

  errorHandler(errorRes: HttpErrorResponse) {
    return Observable.throw(errorRes.error || 'Server error');
  }

  paymentAdded(data = null) {
    this.paymentAddedSource.next(data);
  }

  paymentVoided(data = null) {
    this.paymentVoidedSource.next(data);
  }

}
