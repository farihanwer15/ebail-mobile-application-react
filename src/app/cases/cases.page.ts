import { Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { BondsService } from '../services/bonds.service';

import * as _ from 'lodash'
import { UserStore } from '../@store/user.store';
import { BondDetailsComponent } from '../@components/bond/bond-details/bond-details.component';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.page.html',
  styleUrls: ['./cases.page.scss'],
})
export class CasesPage implements OnInit {

  bonds = [];

  filters = {
    name: undefined,
    pageNumber: 1
  }

  constructor(
    private bondService: BondsService,
    private loadingController: LoadingController,
    private userStore: UserStore,
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getBonds();
  }
  
  loadData(event) {
    
    this.filters.pageNumber++;
    this.getBonds(true);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  async getBonds(append = false){
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });

    await loading.present();

    this.bondService.getBonds({
      pageSize: 30,
      pageNumber: 1,
      recoveryAgentId: this.userStore.getUser().id
    })
    .subscribe(
      async bonds => {

        if (append) {
          this.bonds = _.concat(this.bonds, bonds.data);
        } else {
          this.bonds = bonds.data;
        }
        await loading.dismiss();
      },
      async err => {
        await loading.dismiss();
      }
    )
  }

  
  getPhone(defendant){
    let phone = '';
    if(defendant){
      phone = _.result(_.find(defendant.contacts, (contact) => {
        return contact.key === 'Phone';
      }), 'value');
    }

    return phone;
  }

  
  async openBondDetailsModal(def) {
    
    const modal = await this.modalController.create({
      component: BondDetailsComponent,
      componentProps: {
        defendant: def,
        bondId: def.bonds._id
      }
    });

    await modal.present();

  }
}
