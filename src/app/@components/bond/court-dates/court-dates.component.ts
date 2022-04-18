import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CourtDatesService } from 'src/app/services/court-dates.service';
import { Subscription } from 'rxjs';
import { ActionSheetController, ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CourtDateFormComponent } from '../court-date-form/court-date-form.component';
import { BondsService } from 'src/app/services/bonds.service';

@Component({
  selector: 'app-court-dates',
  templateUrl: './court-dates.component.html',
  styleUrls: ['./court-dates.component.scss'],
})
export class CourtDatesComponent {

  @Input() bondId;
  @Input() courtDates = [];

  constructor(
    private courtDatesService: CourtDatesService,
    public actionSheetController: ActionSheetController,
    public modalController: ModalController,
    public alertController: AlertController,
    private bondsService:BondsService,
    public loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }
  
  async openActionSheet(courtDate){
    const actionSheet = await this.actionSheetController.create({
      header: 'Court Date',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.deleteCourtDate(courtDate._id);
        }
      }, 
      {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.editCourtDate(courtDate);
        }
      }, 
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  async editCourtDate(courtDate){
    const modal = this.modalController.create({
      component: CourtDateFormComponent,
      componentProps: {
        bondId: this.bondId,
        courtDate: courtDate
      }
    });

    (await modal).present();
  }

  async deleteCourtDate(courtDateId){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this court date?',
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
            
            this.courtDatesService.deleteCourtDate(this.bondId, courtDateId)
          .subscribe(
            async () => {
              this.bondsService.bondUpdated();

              const toast = await this.toastController.create({
                color: 'success',
                duration: 3000,
                message: 'Court date has been deleted successfully.',
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
          );
          }
        }
      ]
    });

    await alert.present();
  }
}
