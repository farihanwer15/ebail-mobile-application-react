import { Component, OnInit, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { CourtDateFormComponent } from '../court-date-form/court-date-form.component';
import { DefendantsService } from 'src/app/services/defendants.service';

import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { BondsService } from 'src/app/services/bonds.service';
import { NotesListComponent } from '../../notes/notes-list/notes-list.component';

@Component({
  selector: 'app-bond-status',
  templateUrl: './bond-status.component.html',
  styleUrls: ['./bond-status.component.scss'],
})
export class BondStatusComponent implements OnInit, OnDestroy {

  @Input() defendantId;
  @Input() bond;
  segment = 'court-dates';

  courtDates = [];

  private bondUpdatedSubscription: Subscription;

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private defService: DefendantsService,
    private bondsService: BondsService,
  ) { }

  ngOnInit() {
    this.initBond();
    this.initEvents();
  }

  initBond() {

    if (this.bond && this.bond._id) {
      if (this.bond.courtDates) {
        this.courtDates = this.bond.courtDates;
      }
    }
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
    if(this.defendantId){
      this.defService
      .getDefendant(this.defendantId)
      .subscribe(
        async def => {
          this.bond = _.find(def.bonds, b => {
            return this.bond._id === b._id;
          });

          this.initBond();
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

  async openAddCourtDateModal(){
    const modal = await this.modalController.create({
      component: CourtDateFormComponent,
      componentProps: {
        bondId: this.bond._id
      }
    });

    await modal.present();
  }

  async openNotesModal(){
    const modal = this.modalController.create({
      component: NotesListComponent,
      componentProps: {
        defendantId: this.defendantId
      }
    });

    (await modal).present();
  }

  ngOnDestroy(){
    this.bondUpdatedSubscription.unsubscribe();
  }
}
