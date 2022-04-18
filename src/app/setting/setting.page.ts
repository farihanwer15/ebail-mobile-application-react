import { Component, OnInit, ViewChild, Injectable, RendererFactory2, Inject, Renderer2, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UserStore } from "../@store/user.store";
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Storage } from '@ionic/storage';
import { LoadingController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  renderer: Renderer2;
  isDark;
  constructor(
    private rendererFactory : RendererFactory2,
    @Inject(DOCUMENT)
    private document:Document,
    public userStore: UserStore,
    private authService: AuthService,
    private usersService: UserService,
    private loadingController: LoadingController,
    private storage: Storage,
    private cookieService: CookieService,
    private appService: AppService,


  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null)

   }

  ngOnInit() {
    // const value: string = this.cookieService.get('mode');
    // if(this.userStore.getUser().darkMode){
    //  this.isDark = true
    //  this.renderer.addClass(this.document.body,'dark-theme')
    // }else{
    //   this.isDark = false
    //   this.renderer.removeClass(this.document.body,'dark-theme')
    // }

    this.isDark = this.userStore && this.userStore.getUser() && this.userStore.getUser().darkMode || false;    
  }
 
  async initUser(){
    
    this.usersService.getCurrent()
    .subscribe(
      async user => {
        await this.storage.set('user', user);
        this.userStore.setUser(user);
      async errors => {
        console.log(errors);
      
      }
      })
      
  }
 async OnToggle(event){
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService
    .updateDarkmode({
      darkMode : event.detail.checked,
      id: this.userStore.getUser().id
    })
    .subscribe(
      async response => {
        this.initUser()
         this.cookieService.set( 'mode', JSON.stringify(response));
         this.appService.setDarkMode(response.darkMode || false);
         if(response.darkMode){
         this.isDark = true
         this.renderer.addClass(this.document.body,'dark-theme')
        }else{
          this.isDark = false
          this.renderer.removeClass(this.document.body,'dark-theme')
        }
       
        await loading.dismiss();
        
        
       },
      async errors => {
        await loading.dismiss();
        //await loading.dismiss();
      }
    )
      //this.isDark = true
      //this.renderer.addClass(this.document.body,'dark-theme')
  }

}
