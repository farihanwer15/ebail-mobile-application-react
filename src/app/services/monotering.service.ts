import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
const qs = require('qs');

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  apiUrl: string;
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/monitorings';
  }

  getOrder(id): Observable<any>{
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getOrders(params = null): Observable<any>{
    let query = '';

    if(params){
      query = qs.stringify(params);
    }
    
    return this.http.get(this.apiUrl + '?' + query)
  }

  updateOrder(orderId){
    return this.http.put(`${this.apiUrl}/${orderId}`, {});
  }

  updateSJVOrder(data){
    return this.http.put(`${this.apiUrl}/update-sjv-order`, data);
  }

  cancelOrder(orderId, defId){
    return this.http.delete(`${this.apiUrl}/${orderId}/${defId}`)
  }
}
