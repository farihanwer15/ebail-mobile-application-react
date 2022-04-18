import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BondCollateralsService } from 'src/app/services/bond-collaterals.service';
import { Subscription } from 'rxjs';
import { ActionSheetController, ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { CollateralFormComponent } from '../collateral-form/collateral-form.component';
import { BondsService } from 'src/app/services/bonds.service';

@Component({
  selector: 'app-bond-collaterals',
  templateUrl: './bond-collaterals.component.html',
  styleUrls: ['./bond-collaterals.component.scss'],
})
export class BondCollateralsComponent implements OnDestroy {

  @Input() bondId;
  @Input() collaterals = [];
  @Input() bondIndemnitors = [];

  spinner = false;

  private collateralFormSubscription: Subscription;

  constructor(
    private collateralsService: BondCollateralsService,
    public actionSheetController: ActionSheetController,
    public modalController: ModalController,
    public alertController: AlertController,
    private bondsService: BondsService,
    private loadingController: LoadingController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initEvents();
  }
  
  initEvents(){
    this.collateralFormSubscription = this.collateralsService
    .collateralAdded$
    .subscribe(
      data => {
      }
    )
  }

  async openActionSheet(collateral){
    const actionSheet = await this.actionSheetController.create({
      header: 'Collateral',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.deleteCollateral(collateral._id);
        }
      }, 
      {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.editCollateral(collateral);
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

  async editCollateral(collateral){
    const modal = this.modalController.create({
      component: CollateralFormComponent,
      componentProps: {
        bondId: this.bondId,
        collateralData: collateral,
        bondIndemnitors: this.bondIndemnitors
      }
    });
    (await modal).present();
  }

  async deleteCollateral(collateralId){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this collateral?',
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
            this.collateralsService
            .deleteCollateral(this.bondId, collateralId)
            .subscribe(
              async () => {
                this.bondsService.bondUpdated();
                
                const toast = await this.toastController.create({
                  color: 'success',
                  duration: 3000,
                  message: 'Collateral has been deleted successfully.',
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
  
  ngOnDestroy(){
    this.collateralFormSubscription.unsubscribe();
  }

}
