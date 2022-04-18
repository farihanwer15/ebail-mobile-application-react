import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class BondCollateralsService {

  apiUrl: string;
  private collateralAddedSource = new Subject();
  collateralAdded$ = this.collateralAddedSource.asObservable();

  private getBondCollateralsSource = new Subject();
  getBondCollaterals$ = this.getBondCollateralsSource.asObservable();
  
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/collaterals';
  }

  addCollateral(bondId, data): Observable<any>{
    return this.http.post(`${this.apiUrl}/${bondId}`, data)
  }

  updateCollateral(bondId, collateralId, collateral){
    return this.http.put(`${this.apiUrl}/${bondId}/${collateralId}`, collateral)
  }

  deleteCollateral(bondId, collateralId){
    return this.http.delete(`${this.apiUrl}/${bondId}/${collateralId}`)
  }

  getCollaterals(params = null): Observable<any>{

    let query = qs.stringify(params);
    
    return this.http.get(this.apiUrl + '?' + query);
  }

  errorHandler(errorRes: HttpErrorResponse){
    return Observable.throw(errorRes.error || 'Server error');
  }

  collateralAdded(data){
    this.collateralAddedSource.next(data);
  }

  getBondCollaterals(bondId){
    this.getBondCollateralsSource.next(bondId);
  }
}
