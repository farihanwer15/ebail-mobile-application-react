import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BondsService } from 'src/app/services/bonds.service';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { BondStatusComponent } from '../bond-status/bond-status.component';
import { Router } from '@angular/router';
import { CourtDateFormComponent } from '../court-date-form/court-date-form.component';
import { UserStore } from 'src/app/@store/user.store';
import { NotesListComponent } from '../../notes/notes-list/notes-list.component';
import { DefendantsService } from 'src/app/services/defendants.service';
import { ReceiptsService } from 'src/app/services/receipts.service';
import * as moment from "moment";

@Component({
  selector: 'app-bond-info',
  templateUrl: './bond-info.component.html',
  styleUrls: ['./bond-info.component.scss'],
})
export class BondInfoComponent implements OnInit, OnChanges {

  @Input() defendantId;
  @Input() bond;
  @Input() receipts = true;
  inCustody = undefined;
  defAppUploaded = false;
  courtDates = [];
  nextCourtDate = undefined;
  bondIndemnitors = [];
  collaterals = [];
  timezone = '+0000';

  constructor(
    private bondsService: BondsService,
    private modalController: ModalController,
    public userStore: UserStore,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private defService: DefendantsService,
    private receiptsService: ReceiptsService
  ) { }

  ngOnInit() {
    this.timezone = this.userStore.getAgency().timezone ? this.userStore.getAgency().timezone : '+0000';
    this.getDefendant()
    this.getDefApp();
    this.initBond();
  }

  getDefApp() {
    if (this.bond._id) {
      this.receiptsService
        .getReceipts({
          type: 'Defendant Application',
          bondId: this.bond._id
        })
        .subscribe(
          documents => {
            this.defAppUploaded = documents.data.length > 0 ? true : false;
          },
          errors => { }
        )
    }
  }
  async getDefendant() {
    if (this.defendantId) {
      const loading = await this.loadingController.create();
      await loading.present();
      this.defService
        .getDefendant(this.defendantId)
        .subscribe(
          async def => {
            this.inCustody = def.custody && def.custody.status === 'enabled' ? true : false
            await loading.dismiss();
          },
          async errors => {
            await loading.dismiss();
          }
        )
    }
  }

  initBond() {
    if (this.bond && this.bond._id) {
      if (this.bond.courtDates) {
        this.courtDates = this.bond.courtDates;
        let lastObj = this.courtDates[this.courtDates.length - 1]
        if (moment().diff(lastObj.date) >= 0) {
          this.nextCourtDate = undefined
        }
        else {
          this.nextCourtDate = lastObj.date
        }

      }

      if (this.bond.indemnitors) {
        this.bondIndemnitors = this.bond.indemnitors;
      }

      if (this.bond.collaterals) {
        this.collaterals = this.bond.collaterals;
      }
    }
  }

  async openAddCourtDateModal() {
    const modal = await this.modalController.create({
      component: CourtDateFormComponent,
      componentProps: {
        bondId: this.bond._id
      }
    });

    await modal.present();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.bond) {
      this.initBond();
    }
  }

  async acceptRecoveryCase() {
    const alert = await this.alertController
      .create({
        header: 'Warning',
        message: `Are you sure you want to accept this case?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Yes',
            handler: async () => {


              const loading = await this.loadingController.create({
                message: 'Please wait...',
              });
              await loading.present();

              this.bondsService
                .acceptRecoveryCase(this.defendantId, this.bond._id)
                .subscribe(async res => {
                  const toast = await this.toastController.create({
                    message: 'You have accepted the case.',
                    color: 'success',
                    duration: 3000,
                    position: 'top'
                  });
                  await toast.present();
                  await loading.dismiss();
                  this.bondsService.bondUpdated();
                },
                  async errors => {
                    await loading.dismiss();
                  })
            }
          }
        ]
      });

    await alert.present();
  }

  async openNotesModal() {
    const modal = this.modalController.create({
      component: NotesListComponent,
      componentProps: {
        defendantId: this.defendantId,
        bondId: this.bond._id
      }
    });

    (await modal).present();
  }

  showReceipts(){
    if (this.userStore.getUser()) {
      if (this.userStore.getUser().roles.recoveryAgent && this.bond.recovery.closedDate) {
        return false
      }
    }

    return true;
  }
}
