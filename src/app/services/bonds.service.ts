import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class BondsService {
  apiUrl: string;
  private bondAddedSource = new Subject();
  bondAdded$ = this.bondAddedSource.asObservable();
  
  private bondUpdatedSource = new Subject();
  bondUpdated$ = this.bondUpdatedSource.asObservable();
  
  
  private bondInfoSavedSource = new Subject();
  bondInfoSaved$ = this.bondInfoSavedSource.asObservable();
  
  private forfeitureUpdatedSource = new Subject();
  forfeitureUpdated$ = this.forfeitureUpdatedSource.asObservable();
 
  constructor(
    private http: HttpClient
  ) {
    this.apiUrl = environment.apiUrl + '/bonds';
  }

  getRegularForfeitureBonds(params = null): Observable<any> {

    let query = qs.stringify(params);

    return this.http.get(`${this.apiUrl}/regular-forfeiture-bonds?${query}`)
  }

  updateBondIndemnitor(defId, bondId, indemId, data): Observable<any> {
    return this.http.put(`${this.apiUrl}/indemnitors/${defId}/${bondId}/${indemId}`, data);
  }

  addBond(userId, data): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}`, data);
  }

  updateBond(userId, bondId, data): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/${bondId}`, data)
  }

  getBond(id): Observable<any> {
    return this.http.get(this.apiUrl + '/' + id);
  }

  acceptRecoveryCase(userId, bondId): Observable<any> {
    return this.http.get(`${this.apiUrl}/accept-recovery-case/${userId}/${bondId}`);
  }

  getBonds(params = null): Observable<any> {

    let query = qs.stringify(params);

    return this.http.get(this.apiUrl + '?' + query);
  }

  getBondsStats(params = null): Observable<any>{

    let query = qs.stringify(params);

    return this.http.get(`${this.apiUrl}/stats?${query}`);
  }

  getRecoveryBondStats(params = null): Observable<any>{
    let query = qs.stringify(params);
    return this.http.get(`${this.apiUrl}/recovery-bonds-stats?${query}`);
  }

  deleteBond(id){
    return this.http.delete(this.apiUrl + '/' + id);
  }

  generateBondNumber(): Observable<any> {
    return this.http.get( `${this.apiUrl}/generate-bond-number`)
  }

  addIndemnitorToBond(bondId, data): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-indemnitor/${bondId}`, data);
  }

  removeIndemnitorFromBond(userId, bondId): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove-indemnitor/${userId}/${bondId}`);
  }

  removeForfeiture(id): Observable<any> {
    return this.http.put(this.apiUrl + '/remove-forfeiture/' + id, {});
  }

  removeExoneration(id): Observable<any> {
    return this.http.put(this.apiUrl + '/remove-exoneration/' + id, {})
  }

  freePower(data){
    return this.http.post(this.apiUrl + '/free-power/', data);
  }

   // BOND CONTRACTS ROUTES
   addContractFileToBond(bondId, data): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-contract-file/${bondId}`, data);
  }

  removeContractFileFromBond(userId, contractId): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove-contract-file/${userId}/${contractId}`);
  }

  // EVENTS FUNCTIONS
  bondAdded(data = null) {
    this.bondAddedSource.next(data);
  }
  
  bondUpdated(data = null) {
    this.bondUpdatedSource.next(data);
  }

  bondInfoSaved(data = null) {
    this.bondInfoSavedSource.next(data);
  }

  forfeitureUpdated(data = null) {
    this.forfeitureUpdatedSource.next(data);
  }
 
}
