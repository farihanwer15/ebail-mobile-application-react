import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Input } from '@angular/core';
import { IonicModule, ModalController,LoadingController, ToastController,AlertController } from '@ionic/angular';

import { PublicService } from '../../services/public.service';
import { ReceiptsService } from '../../services/receipts.service';
import { CheckinService } from '../../services/checkin.service';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';
import { PopoverController } from '@ionic/angular';
import { ScheduleRemindersPopoverComponent } from '../schedule-reminders-popover/schedule-reminders-popover.component'

import * as moment from 'moment';
import { UserStore } from "../../@store/user.store";
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-checkin-detail',
  templateUrl: './checkin-detail.component.html',
  styleUrls: ['./checkin-detail.component.scss'],
})

export class CheckinDetailComponent implements OnInit {

  @Input() checkinId;
  spinner = false;

  checkin = undefined;
  center;

  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];
  showLocation;
  mapUrl = undefined;

  timezone = '-0700';

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private publicService: PublicService,
    private receiptService: ReceiptsService,
    private userStore: UserStore,
    private checkinService: CheckinService,
    public popoverController: PopoverController,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    if (this.userStore.getAgency().timezone) {
      this.timezone = this.userStore.getAgency().timezone;
    }
    this.getCheckin();
  }

  getCheckin() {
    if (this.checkinId) {

      this.spinner = true;
      this.publicService
        .getCheckin(this.checkinId)
        .subscribe(
          checkin => {
            this.checkin = checkin;
            if (checkin.location) {
              this.center = {
                lat: checkin.location.lat,
                lng: checkin.location.lng
              }
              this.markerPositions.push(this.center);
              console.log(this.markerPositions);
            }

            if (checkin.schedule) {
              checkin.schedule.forEach(item => {
                // if (moment(item.date, moment.defaultFormat).isBefore(moment())) {
                //   item.missed = true
                // }
                if (!checkin.nextCheckinDate && !item.missed && !item.completedAt) {
                  checkin.nextCheckinDate = item.date;
                }
              });
            }
            this.spinner = false;
          },
          err => {
            this.spinner = false;
          })
    }
  }

  toggleLocation(location, index) {
    this.markerPositions = [];
    this.markerPositions.push(location);
    this.center = location

    if (this.showLocation === index) {
      this.showLocation = undefined;
      this.showLocationRow(-1);
      return;
    }

    if (location) {
      this.mapUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
      this.showLocation = index
    }
  }

 async openFile(filename) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.receiptService
      .getPresignedUrl({
        key: filename
      })
      .subscribe(
      async res => {
        await loading.dismiss();
          this.viewImage({ url: res.url })
        })
  }

  // async viewImage(data) {
  //   const modal = await this.modalController.create({
  //     component: ViewerModalComponent,
  //     componentProps: {
  //       src: data.url, // required
  //       title: '', // optional
  //       text: '', // optional
  //     },
  //     cssClass: 'ion-img-viewer', // required
  //     keyboardClose: true,
  //     showBackdrop: true,
  //   });

  //   return await modal.present();
  // }

  async copyLinkToClipboard(inputElement) {
    console.log('input', inputElement)
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    const toast = await this.toastController.create({
      color: 'success',
      duration: 3000,
      message: 'Copied!',
      showCloseButton: true,
      position: 'top'
    });
    await toast.present()

  }

  showLocationRow(index) {
    if (index === this.showLocation) {
      return true;
    }
    return false;
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async openPopver(data) {
    const modal = this.modalController.create({
      component: ScheduleRemindersPopoverComponent,
      componentProps: {
        data: data,
        type: this.checkin.notificationType
      },
    });
    (await modal).present();
  }

  async resendReminder(schedule) {
    let checkinDate = moment(schedule.date).utcOffset(this.timezone).format('MM/DD/YYYY hh:mm a');
    
    if (this.checkin.notificationType === 'Check in anytime') {
      checkinDate = moment(schedule.date).utcOffset(this.timezone).format('MM/DD/YYYY');
    }
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: `Are you sure you want to send the check in reminder for date (${checkinDate}).`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Yes',
          handler: async () => {

            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
             this.checkinService.resendReminder({
              checkinId: this.checkinId,
              scheduleId: schedule._id
            })
            .subscribe(
                async (res) => {
                  this.getCheckin()
                  await loading.dismiss();
                  const toast = await this.toastController.create({
                    color: 'success',
                    duration: 3000,
                    message: 'Check in reminder sent successfully.',
                    showCloseButton: true,
                    position: 'top'
                  });
                  await toast.present()
                },
                async (err) => {
                  await loading.dismiss();
                }
              );

          }
        }
      ]
    });

    await alert.present();
  }

  async imageView(event, image) {
    event.stopPropagation();
    this.receiptService
      .getPresignedUrl({
        key: image.filename
      })
      .subscribe(
        res => {

          this.viewImage({ url: res.url })
        }
      )
  }
  async viewImage(data) {
    const modal = await this.modalController.create({
      component: ViewerModalComponent,
      componentProps: {
        src: data.url, // required
        title: '', // optional
        text: '', // optional
      },
      cssClass: 'ion-img-viewer', // required
      keyboardClose: true,
      showBackdrop: true,
    });

    return await modal.present();
  }

  async markCheckinAsComplete(schedule) {
    let checkinDate = moment(schedule.date).utcOffset(this.timezone).format('MM/DD/YYYY hh:mm a');
    
    if (this.checkin.notificationType === 'Check in anytime') {
      checkinDate = moment(schedule.date).utcOffset(this.timezone).format('MM/DD/YYYY');
    }
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: `Are you sure you want to mark this date (${checkinDate}) as checked in.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Yes',
          handler: async () => {

            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
            this.checkinService.markAsCheckedIn({
              checkinId: this.checkinId,
              scheduleId: schedule._id
            })
            .subscribe(
                async (res) => {
                  this.getCheckin()
                  await loading.dismiss();
                  const toast = await this.toastController.create({
                    color: 'success',
                    duration: 3000,
                    message: 'Successfullly marked as checked in.',
                    showCloseButton: true,
                    position: 'top'
                  });
                  await toast.present()
                },
                async (err) => {
                  await loading.dismiss();
                }
              );

          }
        }
      ]
    });

    await alert.present();
  }
 
  ngOnDestroy(){
   // this.showLocation = undefined;
  }

}

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [CheckinDetailComponent]
})
class CheckInsPageComponentModule {
}