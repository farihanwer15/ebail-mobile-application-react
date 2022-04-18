import { Component, OnInit } from '@angular/core';
import { BondsService } from '../services/bonds.service';
import { UserStore } from '../@store/user.store';
import { LoadingController, ModalController } from '@ionic/angular';

import * as moment from 'moment';
import * as _ from 'lodash';
import { BondDetailsComponent } from '../@components/bond/bond-details/bond-details.component';
import { FortfeitureFilterFormComponent } from '../@components/bond/fortfeiture-filter-form/fortfeiture-filter-form.component';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-forfeitures',
  templateUrl: './forfeitures.page.html',
  styleUrls: ['./forfeitures.page.scss'],
})
export class ForfeituresPage implements OnInit {
  stats = {
    totalForfeitures: 0,
    openForfeitureLiability: 0,
    openForfeitures: 0,
    closedForfeitures: 0,
    reinstatedForfeitures: 0,
    activeForfeitures: 0,
  }
  bonds = {
    data: [],
    meta: {}
  }

  filters = {
    agencyId: undefined,
    defendantName: undefined,
    agentId: undefined,
    fortDate: {
      start: undefined,
      end: undefined
    },
    state: undefined,
    county: undefined,
    courtId: undefined,
    status: 'opened',
    pageNumber: 1
  }

  constructor(
    private bondsService: BondsService,
    private userStore: UserStore,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    // this.courtsEdit();
  }

  ngOnInit() {
    this.filters.agencyId = this.userStore.getUser().agencyId;
    //this.getForfeitedBonds();
    this.search()
  }

  loadData(event) {
    setTimeout(() => {
      this.filters.pageNumber++;
      this.search(true)
      // this.getForfeitedBonds(true);
      event.target.complete();
    }, 500);
  }
  async openFilterModal(){
    const modal = await this.modalController.create({
      component: FortfeitureFilterFormComponent,
      componentProps: {
        filtersData: this.filters
      }
    });
    modal.onDidDismiss()
    .then((data) => {
      if(data.data){
        this.filters = data.data
        this.search()
       }
    
  });
    (await modal).present();
  }

  onSearchInput(event){
    
    this.filters.defendantName = event.target.value;
    // if (event.target.value.length >= 3) {
    //   this.search();
    // }
    // else if (event.target.value.length < 1) {
    //   this.search();
    // }
  }

 async search(apend?){
    let params: any = {
      agencyId: this.filters.agencyId,
      defendantName: this.filters.defendantName,
      courtId:this.filters.courtId,
      filingAgentId: this.filters.agentId,
      state: this.filters.state,
      county: this.filters.county,
      forfeitureStatus: this.filters.status,
      pageNumber: this.filters.pageNumber,
      pageSize: 30,
    }

    if (this.filters.status === 'opened') {
      params.exoneration = {
        $exists: false
      }
    }

    if(this.filters.fortDate){
      params.forfeitureDate = {}
      if (this.filters.fortDate.start) {
        params.forfeitureDate.start = moment(this.filters.fortDate.start).format('YYYY-MM-DDT23:59:00.000');
      }
      if (this.filters.fortDate.end) {
        params.forfeitureDate.end = moment(this.filters.fortDate.end).utc().format('YYYY-MM-DDT23:59:00.000');
      }
    }
    this.getForfeitedBonds(params , apend);
    this.getStats(params)
  }

  getStats(params = null){
   // delete params.pageSize;
    //delete params.pageNumber;
    
    this.bondsService
    .getBondsStats({
      ...params,
      agencyId: this.userStore.getUser().agencyId
    })
    .subscribe(
      stats => {
        this.stats = stats.length > 0 ? stats[0]: this.stats;
      },
      errors => {
      }
    );
  }
 async getForfeitedBonds(params = null, append? ){
    const loading = await this.loadingController.create();
    await loading.present();
    //this.bonds.data = [];
    this.bondsService
    .getBonds({
      ...params,
      forfeiture: {
        $exists: true
      },
      sortBy: 'bonds.forfeiture.satisfyDate',
      orderBy: 'ASC',
      platform: {
        $ne: 'captira-legacy'
      }
    })
    .subscribe(
     async bonds => {
      
        await loading.dismiss();
        if (append) {
          this.bonds.data = _.concat(this.bonds.data, bonds.data);  
        } else 
        this.bonds = bonds;
        this.bonds.data.forEach(def => {
          def.monitoringCheck = def.monitoring && def.monitoring.status === 'enabled' ? true : false
        })
     async errors => {
        await loading.dismiss();
        //this.spinner = false;
      }
    }
    )
  }
  getRemainingDays(bond){
    const satisfyDate = moment(bond.forfeiture.satisfyDate).utc().format('MM/DD/YYYY');
    const currDate =  moment().utc().format('MM/DD/YYYY');
    var RD = moment(satisfyDate).diff(currDate, 'days');
    return RD;
  }

  async openBondModal(data){
    const modal = this.modalController.create({
      component: BondDetailsComponent,
      componentProps: {
        defendant: data,
        bondId: data.bonds._id
      }
    });

    (await modal).present();
  }
}
