import { Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CheckinService } from '../services/checkin.service';
import { DefendantsService } from '../services/defendants.service';
import { ReceiptsService } from '../services/receipts.service';
import { ActionSheetController, ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';
import { MapViewComponent } from '../@components/map-view/map-view.component'
import { CheckinDetailComponent } from './checkin-detail/checkin-detail.component'

import * as _ from 'lodash';
import * as moment from 'moment';
import { UserStore } from "../@store/user.store";
import { async } from 'rxjs/internal/scheduler/async';

@Component({
  selector: 'app-check-ins-page',
  templateUrl: './check-ins-page.component.html',
  styleUrls: ['./check-ins-page.component.scss'],
})
export class CheckInsPageComponent implements OnInit {
  checkins = [];
  center;

  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];
  showLocation = false;
  mapUrl = undefined;
  spinner = false;
  filter = {
    defName: undefined,
    type: "",
    status: "",
    nextCheckinDate: {
      start: undefined,
      end: undefined
    },
    page: 1
  };

  timezone = '-0700';
  constructor(
    private checkinService: CheckinService,
    private userStore: UserStore,
    private receiptService: ReceiptsService,
    public actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,

  ) { }
  ngOnInit() {
    // this.route.queryParams
    // .subscribe(params => {
    //   if (params.status === 'missed') {
    //     this.filter.status = 'missed'
    //   };
    // });
    this.search();

    if (this.userStore.getAgency().timezone) {
      this.timezone = this.userStore.getAgency().timezone;
    }
  }
  resetFilter() {
    this.filter = {
      defName: undefined,
      type: "",
      status: "",
      nextCheckinDate: {
        start: undefined,
        end: undefined
      },
      page: 1
    };
    this.search();
  }
  async openMapWindow(event, location) {
    event.stopPropagation();
    this.markerPositions = [];
    this.markerPositions.push(location);
    this.center = location;
    if (location) {
      this.mapUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
      const modal = this.modalController.create({
        component: MapViewComponent,
        componentProps: {
          markerPositions: this.markerPositions,
          mapUrl: this.mapUrl,
          center: this.center
        }
      });
      (await modal).present();
    }
  }

  async imageView(event, image) {
    event.stopPropagation();
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.receiptService
      .getPresignedUrl({
        key: image.filename
      })
      .subscribe(
       async res => {
          await loading.dismiss();
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
  loadData(event) {
    this.filter.page++
    this.search(true)
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }
  async getCheckins(params, apend) {
    const loading = await this.loadingController.create();
    await loading.present();
    this.checkinService
      .getCheckins(params)
      .subscribe(
        async checkins => {
          checkins && checkins.forEach(checkin => {

            if (checkin.nextCheckin) {
              let index = _.findIndex(checkin.schedule, s => {
                return s._id === checkin.nextCheckin._id;
              })
              index = index > 0 ? index - 1 : 0;
              checkin.lastCheckin = checkin.schedule[index];
            }
            else {
              checkin.lastCheckin = checkin.schedule[checkin.schedule.length - 1]
            }
          })
          if (apend) {
            this.checkins = _.concat(this.checkins, checkins)
          } else {

            this.checkins = checkins;
          }


          await loading.dismiss();
        },
        async err => {
          this.spinner = false;
          await loading.dismiss();
        }
      )
  }


  async search(apend?) {

    let params: any = {
      agencyId: this.userStore.getAgency()._id,
      pageNumber: this.filter.page,
      pageSize: 20,
      sortBy: 'createdAt',
      orderBy: 'DESC',
      defName: this.filter.defName,
      type: this.filter.type
    }

    if (this.filter.status === 'missed') {
      params.lastMissedCheckin = {
        $exists: true
      }

      params.canceledAt = {
        $exists: false
      }
    }

    if (this.filter.status === 'completed') {
      params.completedAt = {
        $exists: true
      }
      params.canceledAt = {
        $exists: false
      }
    }

    if (this.filter.status === 'upcoming') {
      params.completedAt = {
        $exists: false
      }
      params.canceledAt = {
        $exists: false
      }
      params.nextCheckin = {
        $exists: true
      }
      params.sortBy = 'nextCheckin.date'
      params.orderBy = 'ASC'
    }

    if (this.filter.status === 'canceled') {
      params.canceledAt = {
        $exists: true
      }
    }

    if (this.filter.nextCheckinDate) {
      const timezone = this.userStore.getAgency().timezone ? this.userStore.getAgency().timezone : '-0600';
      params.nextCheckinDate = {}
      if (this.filter.nextCheckinDate.start) {
        params.nextCheckinDate.start = moment(this.filter.nextCheckinDate.start.format('YYYY-MM-DD')).utcOffset(timezone, true).toDate();
      }
      if (this.filter.nextCheckinDate.end) {
        params.nextCheckinDate.end = moment(this.filter.nextCheckinDate.end.format('YYYY-MM-DDT23:59:00.000')).utcOffset(timezone, true).toDate();
      }
    }


    this.getCheckins(params, apend);
  }

  async openActionSheet(checkin) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Check Ins',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'View Checkins Details',
        //role: 'destructive',
        handler: () => {
          this.openCheckinDetailModal(checkin._id);
        }
      },
      {
        text: 'Cancel Checkin',
        handler: () => {
          this.cancelCheckin(checkin._id);
        }
      },
      {
        text: 'Close',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  async cancelCheckin(checkinId) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to cancel this checkin?',
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
            this.checkinService.cancelCheckin(checkinId)
              .subscribe(
                async (res) => {
                  this.search()
                  await loading.dismiss();
                  const toast = await this.toastController.create({
                    color: 'success',
                    duration: 3000,
                    message: 'Checkin canceled successfully.',
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

  async openCheckinDetailModal(checkinId) {
    const modal = this.modalController.create({
      component: CheckinDetailComponent,
      componentProps: {
        checkinId: checkinId
      }
    });
    (await modal).present();
  }



  // deleteCheckin(checkinId){
  //   this.dialogService.open(ConfirmationDialogComponent, {
  //     context: {
  //       text: 'Are you sure you want to delete this check in?'
  //     }
  //   })
  //   .onClose.subscribe(
  //     confirm => {
  //       if (confirm) {
  //         this.checkinService.deleteCheckin(checkinId)
  //         .subscribe(
  //           () => {
  //             this.search()
  //             this.toastrService.show('', 'Check In deleted successfully.', {
  //               status: 'success',
  //               position: NbGlobalPhysicalPosition.TOP_LEFT
  //             });
  //           },
  //           errors => {
  //             console.log(errors);
  //           }
  //         );  
  //       }
  //     }
  //   );
  // }

}