import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { BondsService } from 'src/app/services/bonds.service';

import * as _ from 'lodash';
import { DefendantsService } from 'src/app/services/defendants.service';
import { Subscription } from 'rxjs';
import { UserStore } from 'src/app/@store/user.store';
import { BondStatusComponent } from '../bond-status/bond-status.component';
import { Router } from '@angular/router';
import { DefendantIndemnitorsListComponent } from '../../defendant/defendant-indemnitors-list/defendant-indemnitors-list.component';

@Component({
  selector: 'app-bond-details',
  templateUrl: './bond-details.component.html',
  styleUrls: ['./bond-details.component.scss'],
})

export class BondDetailsComponent implements OnInit, OnDestroy {

  @Input() defendant;
  @Input() bondId;

  bond;
  segment = 'info';

  recoveryAgent = false;

  private bondUpdatedSubscription: Subscription;
  
  constructor(
    private modalController: ModalController,
    private bondsService: BondsService,
    private defService: DefendantsService,
    private loadingController: LoadingController,
    private userStore: UserStore,
    private router: Router,
  ) { }
  
  ngOnInit() {
   console.log('defendant', this.defendant)
    if(this.userStore.getUser() && this.userStore.getUser().roles && this.userStore.getUser().roles.recoveryAgent){
      this.recoveryAgent = true;
    }

    if (this.defendant && this.defendant.bonds) {
      if (Array.isArray(this.defendant.bonds)) {
        this.bond = _.find(this.defendant.bonds, b => {
          return this.bondId === b._id;
        });
      }
      else{
        this.bond = this.defendant.bonds;
      }
    }

    this.initEvents();
  }

  initEvents(){
    this.bondUpdatedSubscription = this.bondsService
    .bondUpdated$
    .subscribe(
      () => {
        this.getDefendant();
      }
    )
  }

  async getDefendant(){
    const loading = await this.loadingController.create();
    
    if(this.defendant && this.defendant._id){
      this.defService
      .getDefendant(this.defendant._id)
      .subscribe(
        async def => {
          console.log('def', def)
          this.bond = _.find(def.bonds, b => {
            return this.bondId === b._id;
          });
          await loading.dismiss();
          
        },
        async err => {
          await loading.dismiss();
        }
      )
    }
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  
  segmentChanged(segment){
    this.segment = segment.detail.value;
  }

  
  async openBondStatusModal(){
    const modal = await this.modalController.create({
      component: BondStatusComponent,
      componentProps: {
        bond: this.bond,
        defendantId: this.defendant._id
      }
    });

    await modal.present();
  }

  
  async editBond() {
    
    await this.modalController.dismiss();
    this.router.navigate([
      'bond-form', 
      this.defendant._id,
      this.bond._id
    ]);
  }

  async openIndemnitorsModal(){
    const modal = this.modalController.create({
      component: DefendantIndemnitorsListComponent,
      componentProps: {
        defendantId: this.defendant._id
      }
    });
    (await modal).present();
  }


  ngOnDestroy(){
    this.bondUpdatedSubscription.unsubscribe();
  }

}
