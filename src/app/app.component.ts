import { Component, OnInit,RendererFactory2, Inject,Renderer2,OnDestroy } from "@angular/core";

import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserStore } from './@store/user.store';
import { UserService } from './services/user.service';
import { Storage } from '@ionic/storage';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AppService } from './services/app.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit{
  darkMode ;
  public appPages = [];
  
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  title = 'angular-idle-timeout';

  appServiceSub: Subscription;
  renderer: Renderer2;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private usersService: UserService,
    private authService: AuthService,
    private router: Router,
    public userStore: UserStore,
    private storage: Storage,
    private idle: Idle,
    private keepalive: Keepalive,
    private alertController: AlertController,
    private appService: AppService,
    private route: ActivatedRoute,
    private rendererFactory : RendererFactory2,
    @Inject(DOCUMENT)
    private document:Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null)


    if (!this.userStore.getUser()) {
      this.goToLoginPage();
    }
    this.appService.getDarkMode().subscribe(res => {
      if (res) {
        
        this.renderer.addClass(this.document.body, 'dark-theme')
      } else {
        this.renderer.removeClass(this.document.body, 'dark-theme')
      }
    })

    this.initUserMenu();
    // sets an idle timeout of 5 seconds, for testing purposes.
    idle.setIdle(1200);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(60);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.'
      console.log(this.idleState);
      this.reset();
    });
    
    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      console.log(this.idleState);
      this.logout();
      this.alertController.dismiss();
    });
    
    idle.onIdleStart.subscribe(() => {
        this.idleState = 'You\'ve gone idle!'
        console.log(this.idleState);
        this.showAlert();
    });
    
    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!'
      console.log(this.idleState);
    });

    this.appServiceSub = this.appService.getUserLoggedIn()
    .subscribe(userLoggedIn => {
      if (userLoggedIn) {

        console.log('Watching IDLE State')
        idle.watch()
        this.timedOut = false;

        this.initUserMenu();

      } else {
        idle.stop();
      }
    })

    // sets the ping interval to 15 seconds
    // keepalive.interval(30);

    // keepalive.onPing.subscribe(() => this.lastPing = new Date());

    // this.reset();

    this.initializeApp();
  }

  ngOnInit(){}



  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
    });
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

  async showAlert(){
    const alert = await this.alertController.create({
      header: 'You\'ve gone idle!',
      message: 'You will be logged out in 30 seconds',
      buttons: [
        {
          text: 'Stay',
          role: 'cancel',
          cssClass: 'primary',
        }
      ]
    });

    await alert.present();
  }

  initUserMenu(){
    this.appPages = [];
    if(this.userStore.getUser() && this.userStore.getUser().roles && this.userStore.getUser().roles.recoveryAgent){
      this.appPages = [
        {
          title: 'Dashboard',
          url: '/home',
          icon: 'home'
        },
        {
          title: 'Cases',
          url: '/cases',
          icon: 'folder'
        },
        // {
        //   title: 'Payments',
        //   url: '/payments',
        //   icon: 'cash'
        // },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: 'list-box'
        },
        {
          title: 'Settings',
          url: '/setting',
          icon: 'settings'
        },
      ]

      return;
    }
    
    this.appPages = [
      {
        title: 'Dashboard',
        url: '/home',
        icon: 'home'
      },
      {
        title: 'Defendants',
        url: '/defendants',
        icon: 'people'
      },
      {
        title: 'Arrest Monitoring',
        url: '/arrest-alerts',
        icon: 'alert'
      },
      {
        title: 'Powers',
        url: '/powers',
        icon: 'paper'
      },
      {
        title: 'Check Ins',
        url: '/checkins',
        icon: 'done-all'
      },
      // {
      //   title: 'Bonds',
      //   url: '/bonds',
      //   icon: 'attach'
      // },
      {
        title: 'Courts',
        url: '/courts',
        icon: 'calendar'
      },
      {
        title: 'Petty-Cash',
        url: '/petty-cash',
        icon: 'cash'
      },
      {
        title: 'Forfeitures',
        url: '/forfeitures',
        icon: 'star-outline'
      },
      {
        title: 'Tasks',
        url: '/tasks',
        icon: 'list-box'
      },
      {
        title: 'Settings',
        url: '/setting',
        icon: 'settings'
      },
    ];
  }


  logout(){
    this.authService.logout();
    this.appService.setUserLoggedIn(false);
    this.goToLoginPage();
  }

  ngOnDestroy(){
    this.appServiceSub.unsubscribe();
  }

  handleAuthStateChange(event, data){
    console.log(event, data);
  }

  goToLoginPage(){
    this.router.navigate(['login']);
  }
}
