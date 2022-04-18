import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  apiUrl: string;
  private paymentAddedSource = new Subject();
  paymentAdded$ = this.paymentAddedSource.asObservable();
  
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/payments';
  }
  
  makePayment(payment){
    return this.http.post(`${this.apiUrl}/make-payment`, payment);
  }

  paymentAdded(data = null) {
    this.paymentAddedSource.next(data);
  }
}
