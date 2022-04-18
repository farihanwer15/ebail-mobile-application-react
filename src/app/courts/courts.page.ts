import { Component, OnInit } from '@angular/core';
import { CourtDatesService } from '../services/court-dates.service';
import { UserStore } from '../@store/user.store';
import { LoadingController, ModalController } from '@ionic/angular';

import * as moment from 'moment';
import * as _ from 'lodash';
import { BondDetailsComponent } from '../@components/bond/bond-details/bond-details.component';
import { CourtFilterFormComponent } from '../@components/bond/court-filter-form/court-filter-form.component';
@Component({
  selector: 'app-courts',
  templateUrl: './courts.page.html',
  styleUrls: ['./courts.page.scss'],
})
export class CourtsPage implements OnInit {

  courtDates = {
    data: [],
    meta: {}
  }
  

  filters = {
    agencyId: undefined,
    defendantName: undefined,
    agentId: undefined,
    // courtDate: undefined,
    courtDate: {
      start: undefined,
      end: undefined,
    },
    state: undefined,
    county: undefined,
    courtId: undefined,
    status: '',
    pageNumber: 1,
    inlcludeRevoked: false
  }

  constructor(
    private courtDatesService: CourtDatesService,
    private userStore: UserStore,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    // this.courtsEdit();
  }


  loadData(event) {
    setTimeout(() => {
      this.filters.pageNumber++;
      this.search(true)
      event.target.complete();
    }, 500);
  }

  ngOnInit() {
    this.filters.agencyId = this.userStore.getUser().agencyId;
   // this.getCourtDates();
    this.search();

  }
  search(apend?){
    let params: any = {
      agencyId: this.filters.agencyId,
      defendantName: this.filters.defendantName,
      courtId: this.filters.courtId,
      agentId: this.filters.agentId,
      state: this.filters.state,
      county: this.filters.county,
      status: this.filters.status,
      pageNumber: this.filters.pageNumber,
      sortBy: 'lastCourtDate.date',
      orderBy: 'DESC',
      pageSize: 30,
    }

    if (!this.filters.inlcludeRevoked) {
      params.bondRevokeStatus = {
        $ne: 'revoked'
      }
    }

    if (params.status === 'upcoming') {
      params.orderBy = 'ASC';
    }

    if(this.filters.courtDate){
      params.courtDate = {}
      if (this.filters.courtDate.start) {
        params.courtDate.start = new Date(this.filters.courtDate.start);
      }
      if (this.filters.courtDate.end) {
        params.courtDate.end = new Date(this.filters.courtDate.end);
      }
    }

    this.getCourtDates(params, apend);
  }


  async openFilterModal(){
    const modal = await this.modalController.create({
      component: CourtFilterFormComponent,
      componentProps: {
        filtersData: this.filters

      }
    });
    modal.onDidDismiss()
    .then((data) => {
    if(data.data){
      this.filters = data.data;
      this.search()
    }
    
  });
    (await modal).present();
  }

  async getCourtDates(params = null,append = false){

    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();

    this.courtDatesService
    .getCourtDates({
      ...params,
      platform: {
        $ne: 'captira-legacy'
      },
     
      // project: {
      //   _id: 1,
      //   name: 1,
      //   "bonds.power": 1,
      //   lastCourtDate: 1,
      //   "bonds.bondAmount": 1,
      //   "bonds.court": 1,
      //   "bonds._id": 1,
      //   "bonds.facility": 1,
      //   "bonds.courtDates": 1

      // }
    })
    .subscribe(
      courtDates => {
        if (append) {
          this.courtDates.data = _.concat(this.courtDates.data, courtDates.data);  
        } else {
          this.courtDates = courtDates;
        }
        loading.dismiss();
      },
      errors => {
        console.log(errors);
        loading.dismiss();
      }
    );
  }

  getCourtDateStatus(courtDate){
    
    if (courtDate) {
      
      if (courtDate.revokeDate) {
        return 'revoked'
      }
      if(!courtDate.date){
        return 'empty';
      }
      if(moment(moment()).isAfter(moment(courtDate.date))){
        return 'passed';
      }
      return 'upcoming';    
    }
    return 'empty';
    
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

  
  onSearchInput(event){
    
    this.filters.defendantName = event.target.value;
    // if (event.target.value.length >= 3) {
    //   this.getCourtDates();
    // }
    // else if (event.target.value.length < 1) {
    //   this.getCourtDates();
    // }
  }


}
