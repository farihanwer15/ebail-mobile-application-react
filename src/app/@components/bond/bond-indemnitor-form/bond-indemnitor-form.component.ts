import { Component, OnInit, Input, Output, EventEmitter,OnDestroy } from '@angular/core';
import { DefendantsService } from 'src/app/services/defendants.service';
import { BondsService } from 'src/app/services/bonds.service';
import { ModalController } from '@ionic/angular';
import { AddBondIndemnitorFormComponent } from '../../../@components/bond/add-bond-indemnitor-form/add-bond-indemnitor-form.component';
import { Subscription } from 'rxjs';
import { IndemnitorsService } from '../../../services/indemnitors.service';

import * as _ from 'lodash';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-bond-indemnitor-form',
  templateUrl: './bond-indemnitor-form.component.html',
  styleUrls: ['./bond-indemnitor-form.component.scss'],
})

export class BondIndemnitorFormComponent implements OnInit,OnDestroy {
  private IndemnitorsUpdatedSubscription: Subscription;

  @Input() bondId;
  @Input() defendantId;
  relation : undefined;
  @Input() bondIndemnitors = [];
  @Input() defendantIndemnitors = [];

  @Output() indemnitorUpdated = new EventEmitter;

  defendant;
  indemnitors = [];

  constructor(
    private defService: DefendantsService,
    private bondsService: BondsService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private indemService: IndemnitorsService,

  ) { }

  ngOnInit() {
     this.getDefendantData();
     this.IndemnitorsUpdatedSubscription = this.indemService
     .indemnitorAdded$
     .subscribe(
       () => {
         this.getDefendantData();
       }
     )
  }

  getDefendantData() {
    this.indemnitors = [];
    this.defService.getDefendant(this.defendantId)
      .subscribe(
        defendant => {
          this.defendant = defendant;

          if (defendant.indemnitors.length > 0) {
            defendant.indemnitors.forEach((indem) => {
              let i = _.find(defendant.indemnitors, (i) => {
                return i.id === indem._id;
              });

              const phone = _.result(_.find(indem.contacts, (contact) => {
                return contact.key === 'Phone';
              }), 'value');

              this.indemnitors.push({
                _id: indem._id,
                name:{first: indem.name.first, last: indem.name.last},
                email: indem.email,
                phone: phone,
                relation: indem.relation
              })
            });
          }
        }
      )
  }
 async editIndemnitor(indem){
    const modal = this.modalController.create({
      component: AddBondIndemnitorFormComponent,
      componentProps: {
        bondId: this.bondId,
        defendantId:this.defendantId, 
        indemnitorId : indem._id,
        relation : this.relation
      }
    });

    (await modal).present();

  }
  isIndemnitorAdded(indem) {
    const ind = _.find(this.bondIndemnitors, i => {
      return i._id === indem._id;
    });

    if (ind) {
      return true;
    }
    return false;
  }

  async addIndemnitorToBond(indem) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });

    await loading.present();
    this.bondsService.addIndemnitorToBond(this.bondId, indem)
      .subscribe(
        async data => {
          await loading.dismiss();
          this.bondsService.bondUpdated();
        },
        async error => {
          await loading.dismiss();
          console.log(error);
        }
      );
  }

  async removeIndemnitorFromBond(indem) {

    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.bondsService.removeIndemnitorFromBond(this.defendantId, indem._id)
      .subscribe(
        async data => {
          await loading.dismiss();
          this.bondsService.bondUpdated();
          // this.totalIndemnitors.emit(this.bondIndemnitors.length);
        },
        async error => {
          await loading.dismiss();
          console.log(error);
        }
      );
  }

  ngOnDestroy(){
    this.IndemnitorsUpdatedSubscription.unsubscribe();
  }

}
