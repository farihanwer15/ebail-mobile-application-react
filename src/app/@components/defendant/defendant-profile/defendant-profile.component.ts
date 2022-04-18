import { Component, OnInit, RendererFactory2, Inject, Renderer2 } from "@angular/core";
import { DefendantsService } from 'src/app/services/defendants.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BondsService } from 'src/app/services/bonds.service';
import { NoteFormComponent } from '../../notes/note-form/note-form.component';
import { NotesListComponent } from '../../notes/notes-list/notes-list.component';
import { DefendantIndemnitorsListComponent } from '../defendant-indemnitors-list/defendant-indemnitors-list.component'
import { ScanDocumentComponent } from '../../scan-document/scan-document.component';
import { ArrestAlertComponent } from '../../arrest-alert/arrest-alert.component';
import { UserStore } from "../../../@store/user.store";
import * as _ from 'lodash'
import { InvoicesService } from 'src/app/services/invoices.service';
import { DefendantFormComponent } from '../defendant-form/defendant-form.component';
import { AppService } from '../../../services/app.service';
import { DOCUMENT } from '@angular/common';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { async } from "@angular/core/testing";
import { MonitoringService } from 'src/app/services/monotering.service';
import { PaymentFormComponent } from '../../payment-form/payment-form.component';
import {InvoiceFormComponent} from '../../invoices/invoice-form/invoice-form.component'
import { ReceiptsService } from "../../../services/receipts.service";
@Component({
  selector: 'app-defendant-profile-component',
  templateUrl: './defendant-profile.component.html',
  styleUrls: ['./defendant-profile.component.scss'],
})
export class DefendantProfileComponent implements OnInit {

  defendantId;
  defendant: any = {
    name: {
      first: undefined,
      last: undefined,
    },
    onBoardedAt: undefined,
    inRecovery: false
  };
  forfeitedBonds = {
    data: [],
    meta: {}
  }

  activeForfeitureBonds = [];
  pastForfeitureBonds = [];
  bonds = [];

  balanceOwed = 0;
  darkMode = true;
  renderer: Renderer2;
  avatar = undefined  
  constructor(
    private defService: DefendantsService,
    private route: ActivatedRoute,
    private bondsService: BondsService,
    private router: Router,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private invoiceService: InvoicesService,
    public userStore: UserStore,
    private appService: AppService,
    private rendererFactory: RendererFactory2,
    public alertController: AlertController,
    private monitoringService: MonitoringService,
    private receiptsService: ReceiptsService,

    @Inject(DOCUMENT)
    private document: Document

  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null)

  }

  ngOnInit() {
    this.defendantId = this.route.snapshot.paramMap.get('defendantId');
    this.appService.getDarkMode().subscribe(res => {
      if (res) {
        this.darkMode = true;

        this.renderer.addClass(this.document.body, 'dark-theme')
      } else {
        this.renderer.removeClass(this.document.body, 'dark-theme')
        this.darkMode = false;

      }
    })
    this.getDefendantData();
    this.getDefendantInvoices();
  }
  onMonitoringToggle(checked, def) {
    if (!this.defendant.monitoringCheck) {
      this.startMonitoring(def)
    }
    else if (this.defendant.monitoringCheck && def.monitoring.monitoringId) {
      this.cancelOrder(def, def.monitoring.monitoringId)
    }
  }
  async getDefendantData() {

    const loading = await this.loadingController.create();
    await loading.present();

    this.defService
      .getDefendant(this.defendantId)
      .subscribe(
        async def => {
          console.log('log', def)
          def.monitoringCheck = def.monitoring && def.monitoring.status === 'enabled' ? true : false
          this.defendant = def;
          if(def.avatar){
            this.getPresignedUrlForAvatar(def.avatar)
          }else{
            this.avatar  =undefined
          }
          this.bonds = def.bonds ? def.bonds : [];

          this.bonds.forEach(bond => {
            if (bond.recovery && !bond.recovery.closedDate) {
              this.defendant.inRecovery = true;
            }
          })
          this.getForfeitedBonds(def.bonds);
          await loading.dismiss();
        },
        async errors => {
          await loading.dismiss()
        }
      )
  }
  getPresignedUrlForAvatar(avatar){
    this.receiptsService
    .getPresignedUrl({
      key: avatar.filename
    })
    .subscribe(
      res => {
        console.log('ava', res)
        this.avatar = res.url
      }
    )
  }

 async createInvoice(){
    const modal = await this.modalController.create({
      component: InvoiceFormComponent,
      componentProps: {
        defendantId: this.defendant._id,
      },
      cssClass: 'payment-form-modal'
    });

    await modal.present();

  }

async collectPaiment(){
    const modal = await this.modalController.create({
      component: PaymentFormComponent,
      componentProps: {
        defendantId: this.defendant._id
      },
      cssClass: 'payment-form-modal'
    });

    await modal.present();
  }

  async onBoardDefendant() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.defService.updateDefendant(this.defendantId, {
      onBoardedAt: new Date()
    })
      .subscribe(
        async response => {
          this.getDefendantData();
          await loading.dismiss()
        },
        async errors => {

          await loading.dismiss()
        }
      )
  }
  async cancelOrder(def, monitorId) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to disable Arrest Alerts for this defendant?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: async () => {
            this.defendant.monitoringCheck = true;
          }
        },
        {
          text: 'Yes',
          handler: async () => {

            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
            this.monitoringService.cancelOrder(monitorId, def._id)
              .subscribe(
                async res => {
                  this.getDefendantData();
                  await loading.dismiss();
                },
                async errors => {
                  console.log(errors);

                }
              );
          }
        }
      ]
    });

    await alert.present();
  }
  async startMonitoring(def) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'By turning on "Arrest monitoring" you will be charged $0.75/mo. You can view all people being monitored here" Charges will be applied to your monthly payment.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: async () => {
            this.defendant.monitoringCheck = false

          }
        },
        {
          text: 'Yes',
          handler: async () => {

            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
            this.defService.startMonitoring(def._id)
              .subscribe(async res => {
                console.log(res)

                this.getDefendantData();
                await loading.dismiss();
              },
                async err => {
                  await loading.dismiss();
                  console.log(err);
                  // this.spinner = false;
                })
          }
        }
      ]
    });

    await alert.present();
  }

  getForfeitedBonds(bonds) {

    this.activeForfeitureBonds = [];
    this.pastForfeitureBonds = [];

    if (bonds && bonds.length > 0) {
      bonds.forEach(bond => {
        if (bond.forfeiture) {
          if (bond.forfeiture.status === 'opened' && !bond.exoneration) {
            this.activeForfeitureBonds.push(bond)
          }
          else {
            this.pastForfeitureBonds.push(bond);
          }
        }
      });
    }
  }

  viewBonds() {
    this.router.navigate([
      'defendants/defendant-bonds',
      this.defendantId
    ]);
  }

  async viewIndemintors() {
    const modal = this.modalController.create({
      component: DefendantIndemnitorsListComponent,
      componentProps: {
        defendantId: this.defendantId
      }
    });
    (await modal).present();
  }

  addBond() {
    this.router.navigate([
      'bond-form',
      this.defendantId
    ]);
  }

  async openNoteModal() {
    const modal = this.modalController.create({
      component: NotesListComponent,
      componentProps: {
        defendantId: this.defendantId
      }
    });

    (await modal).present();
  }

  async openAddDocumentModal() {
    const modal = this.modalController.create({
      component: ScanDocumentComponent,
      componentProps: {
        defendantId: this.defendantId
      }
    });
    (await modal).present();
  }

  async openArrestAlertModal() {
    const modal = this.modalController.create({
      component: ArrestAlertComponent,
      componentProps: {
        monitoringId: this.defendant.monitoring.monitoringId,
        defendant : this.defendant
      }
    });
    (await modal).present();
  }
  getDefendantInvoices() {
    if (this.defendantId) {
      this.invoiceService
        .getInvoices({
          defendantId: this.defendantId,
          status: "pending",
        })
        .subscribe(
          (invoices) => {
            this.balanceOwed = 0;
            invoices.data.forEach((invoice) => {
              this.balanceOwed += parseFloat(invoice.totalAmount);
            });
            // this.spinner = false;
          },
          (errors) => {
            // this.spinner = false;
          }
        );
    }
  }

  async openDefendantEditForm() {
    const modal = await this.modalController.create({
      component: DefendantFormComponent,
      componentProps: {
        defendantId: this.defendantId
      }
    });
    modal.onDidDismiss()
    .then((data) => {
  
      this.getDefendantData()
    
  });

    (await modal).present();
  }
}
