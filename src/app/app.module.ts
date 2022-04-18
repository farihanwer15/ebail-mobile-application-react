import { NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ChartsModule } from 'ng2-charts';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage'
import { AuthInterceptor } from './_helpers/auth.interceptor';
import { InitUserService } from './services/init-user.service';
import { ComponentsModule } from './@components/components.module';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
// import { OCR } from '@ionic-native/ocr/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { PipesModule } from './pipes/pipes.module';
import { CookieService } from 'ngx-cookie-service';

export function init_app(injector: Injector,) {
  return () =>
    new Promise<any>((resolve: Function) => {
      const initUserService = injector.get(InitUserService);
      console.log('hey');
      initUserService.initCurrentUser().subscribe(() => { },
        () => resolve(), () => resolve()); // a place for logging error
    });
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    ComponentsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NgIdleKeepaliveModule.forRoot(),
    PipesModule,
    NgxIonicImageViewerModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    InitUserService,
    CookieService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [Injector],
      multi: true,
    },
    // OCR,
    FileChooser,
    FileTransfer,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
