import { Component, OnInit, ViewChild,RendererFactory2, Inject, Renderer2, } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Storage } from '@ionic/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { UserStore } from '../@store/user.store';
import { UserService } from '../services/user.service';
import { AppService } from '../services/app.service';
import { LoadingController, MenuController, ToastController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { computeStackId } from '@ionic/angular/dist/directives/navigation/stack-utils';
import { InitUserService } from '../services/init-user.service';
import { DOCUMENT } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('loginForm', { static: false }) loginForm: NgForm;
  @ViewChild('verifyTokenForm', { static: false }) verifyTokenForm: NgForm;
  renderer: Renderer2;
  isDark;
  email = undefined;
  password = undefined;
  form = 'login';
  token = undefined;

  resetEmail = undefined;
  passForm = undefined
  errors = [];
  passVerificationCode = undefined;
  newPassword = undefined

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    public userStore: UserStore,
    private usersService: UserService,
    private appService: AppService,
    private loadingController: LoadingController,
    private menuController: MenuController,
    private toastController: ToastController,
    private iniUserService: InitUserService, 
    private cookieService: CookieService,
    private rendererFactory : RendererFactory2,
    @Inject(DOCUMENT)
    private document:Document,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null)
  }

  async ngOnInit() {
    const value: string = this.cookieService.get('mode');
    if(value){
      const darkmode = JSON.parse(value);
      if(darkmode.darkMode){
        this.isDark = true
       this.renderer.addClass(this.document.body,'dark-theme')
      }else{
        this.isDark = false

        this.renderer.removeClass(this.document.body,'dark-theme')
      }
    }

    

  }
  async validate(){
    this.errors = [];

    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.controls[key].markAsTouched();
      });
      this.errors.push('Username and password is required.');

      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Username and password is required.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false;
    }
    if(this.errors.length > 0){
      return false;
    }
    return true;
  }
  async onSubmit(){
    if (!await this.validate()) {
      return;
    }

    const loading = await this.loadingController.create();
    await loading.present();

    this.authService
    .login({
      email: this.email,
      password: this.password,
      username: this.email
    })
    .subscribe(
      async response => {
        await this.storage.set('token', response.token.access_token);
        await this.storage.set('refreshToken', response.token.refresh_token);
        await loading.dismiss();
        this.initUser();
        
      },
      async errors => {
        console.log('errors', errors);
        await loading.dismiss();

        let message = 'Incorrect login details.';
        if (errors.error.error.code === 'UserNotConfirmedException') {
          this.form = 'token';
          message = errors.error.error.message;
        }

        const toast = this.toastController.create({
          color: 'danger',
          duration: 3000,
          message: message,
          position: 'top'
        });
        (await toast).present();
      }
    )
  }

  async initUser(){

    const loading = await this.loadingController.create();
    await loading.present();
    
    this.usersService.getCurrent()
    .subscribe(
      async user => {
        await this.storage.set('user', user);
        this.userStore.setUser(user);
        this.router.navigateByUrl('/home');

        this.appService.setUserLoggedIn(true);
        this.iniUserService.getStates();
        this.iniUserService.getCounties();

        await loading.dismiss();
      },
      async errors => {
        console.log(errors);
        await loading.dismiss();
      }
    );
  }

  async validateTokenForm(){
    this.errors = [];

    if (this.verifyTokenForm.invalid) {
      Object.keys(this.verifyTokenForm.controls).forEach(key => {
        this.verifyTokenForm.controls[key].markAsTouched();
      });
      this.errors.push('Please enter a token.');

      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message: 'Please enter a valid token.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return false;
    }

    if(this.errors.length > 0){
      return false;
    }
    return true;
  }

  async verifyToken(){
    if (!await this.validateTokenForm()) {
      return;
    }

    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.verifyCode({
      code: this.token,
      username: this.email
    })
    .subscribe(
      async res => {
        
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message:  'Your account has been verified succesfully.',
          showCloseButton: true,
          position: 'top'
        });
  
        await toast.present();

        this.form = 'login';
        await loading.dismiss();
      },
      async errors => {
        console.log(errors);
        await loading.dismiss();
      }
    )
  }

  async resendCode(){
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.resendCode({
      username: this.email
    })
    .subscribe(
      async res => {

        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message:  `A verification code has been sent to ${res.CodeDeliveryDetails.Destination}`,
          showCloseButton: true,
          position: 'top'
        });
  
        await toast.present();
  
        await loading.dismiss();
      },
      async errors => {
        console.log(errors);
        await loading.dismiss();
      }
    )
  }

  ionViewWillEnter(){
    this.menuController.enable(false);
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menuController.enable(true);
  }

  openForgotPasswordForm(){
    this.form = 'reset-pasword';
    this.passForm = 'request'
  }

  goToLogin(){
    this.form = 'login';
    this.passForm = undefined;
  }

  async requestPassword(){

    if (!this.resetEmail) {

      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message:  'Email field is required.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return;
    }

    
    const loading = await this.loadingController.create();
    await loading.present();
    
    this.authService.requestPasswordReset({
      username: this.resetEmail
    })
    .subscribe(
      async () => {
        
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message:  'A verification code has been sent to your email.',
          showCloseButton: true,
          position: 'top'
        });

        await toast.present();
        loading.dismiss();

        this.passForm = 'verify-code';
      },
      async err => {
        
        const toast = await this.toastController.create({
          color: 'danger',
          duration: 3000,
          message:  'Invalid email address.',
          showCloseButton: true,
          position: 'top'
        });

        await toast.present();
        loading.dismiss();
      }
    )
  }

  async verifyPassCode(){
    if (!this.passVerificationCode || ! this.newPassword) {

      const toast = await this.toastController.create({
        color: 'danger',
        duration: 3000,
        message:  'Verification code and password is required.',
        showCloseButton: true,
        position: 'top'
      });

      await toast.present();

      return;
    }

    
    const loading = await this.loadingController.create();
    await loading.present();
    
    this.authService.verifyPassConfirmationCode({
      username: this.resetEmail,
      code: this.passVerificationCode,
      password: this.newPassword
    })
    .subscribe(
      async () => {
        
        const toast = await this.toastController.create({
          color: 'success',
          duration: 3000,
          message:  'Code verified successfully',
          showCloseButton: true,
          position: 'top'
        });

        await toast.present();
        loading.dismiss();

        this.form = 'login';
        this.passForm = undefined;

        // this.passForm = 'verify-code';
      },
      async err => {
        
        const toast = await this.toastController.create({
          color: 'danger',
          duration: 3000,
          message:  err.error.error.message,
          showCloseButton: true,
          position: 'top'
        });

        await toast.present();
        loading.dismiss();
      }
    )
  }


}
