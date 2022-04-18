import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { LoadingController, ModalController, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { DefendantsService } from "../../../services/defendants.service";
import { AddBondIndemnitorFormComponent } from '../../bond/add-bond-indemnitor-form/add-bond-indemnitor-form.component'
import { IndemnitorsService } from '../../../services/indemnitors.service';
import { Subscription } from 'rxjs';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-defendant-indemnitors-list',
  templateUrl: './defendant-indemnitors-list.component.html',
  styleUrls: ['./defendant-indemnitors-list.component.scss'],
})
export class DefendantIndemnitorsListComponent implements OnInit {
  @Input() defendantId;
  private IndemnitorsUpdatedSubscription: Subscription;
  indemnitors = [];

  constructor(
    private modalController: ModalController,
    private defendantsService: DefendantsService,
    private actionSheetController: ActionSheetController,
    public alertController: AlertController,
    private loadingController: LoadingController,
    public toastController: ToastController,
    private indemService: IndemnitorsService,
  ) { }

  ngOnInit() {
    this.getDefendantData()
    this.initEvent()
  }

  initEvent() {
    this.IndemnitorsUpdatedSubscription = this.indemService
      .indemnitorAdded$
      .subscribe(
        () => {
          this.getDefendantData();
        }
      )
  }

  async openIndemnitorForm(indemId?, relation?) {
    const modal = this.modalController.create({
      component: AddBondIndemnitorFormComponent,
      componentProps: {
        // bondId: this.bondId,
        defendantId: this.defendantId,
        indemnitorId: indemId,
        relation: relation
      }
    });

    (await modal).present();
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async openActionSheet(indem) {
    let buttons = [];
    buttons.push({
      text: 'Delete',
      role: 'destructive',
      icon: 'trash',
      handler: () => {
        this.deleteIndemnitor(indem._id);
      }
    })
    buttons.push({
      text: 'Edit',
      icon: 'create',
      handler: () => {
        this.openIndemnitorForm(indem._id, indem.relation);
      }
    })
    if (!indem.badInfo) {
      buttons.push({
        text: 'Bad Info',
        icon: 'create',
        handler: () => {
          this.badIndemnitor(indem._id);
        }
      })
    }
    buttons.push({
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
    })

    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      cssClass: 'my-custom-class',
      buttons: buttons
    });
    await actionSheet.present();
  }

  async badIndemnitor(indemId) {
    const data = { badInfo: true }
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to mark as bad this indemnitor contact ?',
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
            this.defendantsService
              .updateIndemnitor(this.defendantId, indemId, data)
              .subscribe(
                async (res) => {
                  this.getDefendantData()
                  const toast = await this.toastController.create({
                    color: 'success',
                    duration: 3000,
                    message: 'Indemnitors contact marked as bad successfully',
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

  async deleteIndemnitor(indemId) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this Indemnitor?',
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
            this.defendantsService
              .deleteIndemnitor(this.defendantId, indemId)
              .subscribe(
                async (res) => {
                  this.getDefendantData()
                  const toast = await this.toastController.create({
                    color: 'success',
                    duration: 3000,
                    message: 'Indemnitor has been deleted successfully.',
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

  async getDefendantData() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.defendantsService.getDefendant(this.defendantId).subscribe(
      async (def) => {
        def.indemnitors
          && def.indemnitors.forEach(payer => {
            if (payer && payer.contacts && payer.contacts.length) {
              payer.contacts.forEach(contact => {
                if (contact.primary) {
                  payer.contacts[payer.contacts.length - 1]['display'] = true
                } else {
                  payer.contacts[payer.contacts.length - 1]['display'] = true
                }
              });
            }
          });
        this.indemnitors = def.indemnitors ? def.indemnitors : [];
        await loading.dismiss();
      },
      async (errors) => {
        await loading.dismiss();
      }
    );
  }

  ngOnDestroy() {
    this.IndemnitorsUpdatedSubscription.unsubscribe();
  }
}