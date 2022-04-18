import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './user.service';
import { UserStore } from '../@store/user.store';
import { StatesService } from './states.service';
import { CountiesService } from './counties.service';
import { AppService } from './app.service';

@Injectable()
export class InitUserService {
  constructor(
    protected userStore: UserStore,
    protected usersService: UserService,
    private router: Router,
    private statesService: StatesService,
    private countiesService: CountiesService,
    private route: ActivatedRoute,
    private appService: AppService,
  ) { }

  initCurrentUser(): Observable<any> {

    
    // if (!this.userStore.getUser()) {
    //   this.goToLoginPage();
    // }


    return this.usersService.getCurrent()
      .pipe(tap((user) => {
        if (user) {
          this.userStore.setUser(user);        
          this.appService.setDarkMode(user.darkMode || false);
          if (!user.office || !user.agencyId) {
            this.router.navigateByUrl('/login');
            // this.goToLoginPage();
          }
        }
        // }
        this.getStates();
        this.getCounties();
      }));
  }

  getStates(){
  	this.statesService.getStates().subscribe(
  		states => {
  			this.userStore.setStates(states)
  		},
  		error => console.log(error)
  	)
  }

  getCounties(){
  	this.countiesService.getCounties().subscribe(
  		counties => {
  			this.userStore.setCounties(counties)
  		},
  		error => console.log(error)
  	)
  }

  goToLoginPage() {
    this.route.queryParams.subscribe(
      params => {
        if (params['code']) {
        }
        else{
          setTimeout(() => {
            window.location.href = "https://ebail.auth.us-east-1.amazoncognito.com/login?client_id=7mqgkenjcpspcalb04l8optjlh&response_type=code&scope=email+openid+phone&redirect_uri=http://localhost:8100/&state=defendantId=123+agencyId=456";
          }, 5000)
          
        }
      }
    )
  }
}
