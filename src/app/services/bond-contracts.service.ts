import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
const qs = require('qs');

@Injectable({
  providedIn: 'root'
})
export class BondContractsService {

  apiUrl: string;
  private contractSentSource = new Subject();
  contractSent$ = this.contractSentSource.asObservable();

  private refreshContractsSource = new Subject();
  refreshContracts$ = this.refreshContractsSource.asObservable();

  private contractAddedSource = new Subject();
  contractAdded$ = this.contractAddedSource.asObservable();

  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/bond-contracts';
  }

  addContract(data){
    return this.http.post(this.apiUrl, data)
  }

  updateContract(contractId, data){
    return this.http.put(`${this.apiUrl}/${contractId}`, data)
  }

  sendContract(data){
    return this.http.post(this.apiUrl + '/send-contracts', data)
  }

  signContract(data){
    return this.http.post('http://localhost:8081/esign-status-update', data)
  }

  syncContract(contractId){
    return this.http.get(`${this.apiUrl}/sync-contract/${contractId}`)
  }

  resendContractLink(data){
    return this.http.post(this.apiUrl + '/resend-contract-link', data)
  }

  getContracts(params = null): Observable<any>{
    let query = qs.stringify(params);

    return this.http.get(this.apiUrl + '?' + query)
  }
  
  deleteContract(id): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  getContract(id): Observable<any>{
    return this.http.get(this.apiUrl + '/' + id)
  }

  errorHandler(errorRes: HttpErrorResponse) {
    return Observable.throw(errorRes.error || 'Server error');
  }

  // EVENTS FUNCTIONS
  contractSent(data = null){
    this.contractSentSource.next(data);
  }

  refreshContracts(data = null){
    this.refreshContractsSource.next(data);
  }
  
  contractAdded(data = null){
    this.contractAddedSource.next(data);
  }
}
