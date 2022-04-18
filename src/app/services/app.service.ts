import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private userLoggedIn = new Subject<boolean>();
  private darkMode = new BehaviorSubject<boolean>(false);

  constructor() {
    this.userLoggedIn.next(false);
  }

  setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }

  getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }

  setDarkMode(mode: boolean) {
    this.darkMode.next(mode);
  }

  getDarkMode(): Observable<boolean> {
    return this.darkMode.asObservable();
  }

}
