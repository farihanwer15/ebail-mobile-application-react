import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController,LoadingController } from '@ionic/angular';
import { MonitoringService } from '../../services/monotering.service';
import { AppService } from '../../services/app.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-arrest-alert',
  templateUrl: './arrest-alert.component.html',
  styleUrls: ['./arrest-alert.component.scss'],
})

export class ArrestAlertComponent implements OnInit {
  @Input() monitoringId;
  @Input() defendant;

  darkMode = true;
  order = {
    status: undefined,
    jurisdiction: {
      country: undefined,
      county: undefined,
      state: undefined
    },
    activity: [],
    booking: {
      results: []
    },
    substatus: undefined
  };

    
  
  constructor(
    private modalController: ModalController,
    private monitoringService: MonitoringService,
    private loadingController: LoadingController,
    private appService: AppService,
  ) { }

  ngOnInit() {
    if(this.monitoringId){
      this.getOrder()
    }
    console.log('defendant', this.defendant)
    this.appService.getDarkMode().subscribe(res => {
      if (res) {
        this.darkMode = true;
        
      } else {
        this.darkMode = false;
  
      }
    })
   }

  async getOrder(){
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
   this.monitoringService.getOrder(this.monitoringId)
      .subscribe(
       async order => {
         console.log('order', order)
          this.order = order.order;
          this.order.activity = _.orderBy(this.order.activity, ['addedDate'], ['desc']);
          if (this.order.booking.results && this.order.booking.results.length > 0) {
            this.order.booking.results = _.orderBy(this.order.booking.results, ['bookingDate'], ['desc']);
          }
          await loading.dismiss();

        },
       async err => {
        await loading.dismiss();
        }
      )
    }
  
  async closeModal() {
    await this.modalController.dismiss();
  }

}

@NgModule({
  imports: [
 
  CommonModule,
    IonicModule,
  ],
  declarations: [ArrestAlertComponent]
})
class ArrestAlertModule {
}