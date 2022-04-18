import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { UserStore } from '../@store/user.store';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class PaymentPlanService {

  apiUrl: string;
  private refreshPaymentPlanSource = new Subject();
  refreshPaymentPlan$ = this.refreshPaymentPlanSource.asObservable();

  constructor(
    private http: HttpClient,
    private userStore: UserStore
  ) {
    this.apiUrl = environment.apiUrl + '/payment-plans';
  }

  addPaymentPlan(data): Observable<any>{
    return this.http.post(this.apiUrl, data); 
  }

  updatePaymentPlan(id, data): Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, data); 
  }

  getByFilter(params): Observable<any>{
    let query = qs.stringify(params)
    return this.http.get(`${this.apiUrl}/get-by-filters?${query}`);
  }

  cancelPaymentPlan(id): Observable<any>{
    return this.http.delete(`${this.apiUrl}/cancel-plan/${id}`); 
  }
  
  generateInvoices(data) {
    return this.http.post(`${this.apiUrl}/generate-invoices`, data);
  }

  refreshPaymentPlan(bondId = null) {
    return this.refreshPaymentPlanSource.next(bondId);
  }

}
