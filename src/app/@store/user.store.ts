
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Storage } from '@ionic/storage';
import { AppService } from '../services/app.service';

import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private user: any;
  private states: Array<any>;
  private counties: Array<any>;

  constructor(
    private storage: Storage,
    private appService: AppService,
  ) { }

  getUser(): any {
    return this.user;
  }

  setUser(paramUser: any) {
    this.user = paramUser;
    paramUser ?  this.appService.setDarkMode(paramUser.darkMode ) : null;
  }

  setStates(states){
    this.states = states;
  }

  getStates(){
    return this.states;
  }

  setCounties(counties){
    this.counties = counties;
  }

  getCounties(){
    return this.counties;
  }

  getCountiesByState(state){
    let counties = _.filter(this.counties, (county) => {
      return county.state === state;
    });
    return counties;
  }

  getAgency(){
    return this.user.agency;
  }

}
